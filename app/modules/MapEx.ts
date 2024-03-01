import MapboxDraw, {
  DrawCreateEvent,
  DrawMode,
  DrawModeChangeEvent,
  DrawSelectionChangeEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import { Feature, Position } from "geojson";
import { GeoJSONSource, Map } from "mapbox-gl";
import { getCenter } from "../utils";
import EventHandler from "./EventHandler";

type LabelGetter = (feature: Feature) => Promise<string>;

type LabelOptions = {
  position: Position;
  text: string;
};

class MapEx extends Map {
  public modeChange = new EventHandler<DrawMode>();
  public selectionChange = new EventHandler<string[]>();
  public labelGetter: LabelGetter = async () => `Untitled`;
  private draw: MapboxDraw;
  private labelId = 0;
  private labelMap: Record<string, string> = {};

  activateDraw() {
    if (!this.draw) {
      this.draw = new MapboxDraw({
        displayControlsDefault: false,
        defaultMode: "draw_polygon",
      });
      this.addControl(this.draw);
      this.on("draw.create", this.handleDrawCreate);
      this.on("draw.update", this.handleDrawUpdate);
      this.on("draw.modechange", this.handleModeChange);
      this.on("draw.selectionchange", this.handleDrawSelectionChange);
    } else {
      this.draw.changeMode("draw_polygon");
    }
    this.getCanvas().style.cursor = "crosshair";
  }

  deleteDraw(id: string) {
    const labelId = this.labelMap[id];
    delete this.labelMap[id];
    this.removeLabel(labelId);
    this.draw.delete(id);
    this.selectionChange.invoke(this.draw.getSelectedIds());
  }

  addLabel({ position, text }: LabelOptions) {
    const id = `label-${++this.labelId}`;

    this.addSource(id, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: { text },
        geometry: {
          type: "Point",
          coordinates: position,
        },
      },
    });

    this.addLayer({
      id,
      type: "symbol",
      source: id,
      layout: {
        "text-field": ["get", "text"],
        "text-anchor": "center",
        "text-size": 16,
      },
      paint: {
        "text-color": "#2563eb",
        "text-halo-color": "#fff",
        "text-halo-width": 2,
      },
    });

    return id;
  }

  updateLabel(id: string, { position, text }: Partial<LabelOptions>) {
    const source = this.getSource(id) as any;
    if (!source) return false;

    source.setData({
      ...source._data,
      ...(text ? { properties: { text } } : {}),
      ...(position
        ? {
            geometry: {
              type: "Point",
              coordinates: position,
            },
          }
        : {}),
    });

    return true;
  }

  removeLabel(id: string) {
    this.removeLayer(id);
  }

  getLabel(id: string) {
    return this.getSource(id) as GeoJSONSource;
  }

  private handleModeChange = ({ mode }: DrawModeChangeEvent) => {
    this.getCanvas().style.cursor =
      mode === "simple_select" ? "pointer" : "crosshair";
    this.modeChange.invoke(mode);
  };

  private handleDrawSelectionChange = ({
    features,
  }: DrawSelectionChangeEvent) => {
    if (!features) return;
    this.selectionChange.invoke(features.map(({ id }) => `${id}`));
  };

  private handleDrawCreate = async ({
    features: [feature],
  }: DrawCreateEvent) => {
    const text = await this.labelGetter(feature);
    const { lng, lat } = getCenter(feature.geometry);
    const labelId = this.addLabel({
      position: [lng, lat],
      text,
    });
    this.labelMap[feature.id] = labelId;
    this.selectionChange.invoke([`${feature.id}`]);
  };

  private handleDrawUpdate = ({ features: [feature] }: DrawUpdateEvent) => {
    const { lng, lat } = getCenter(feature.geometry);
    const labelId = this.labelMap[feature.id];
    this.updateLabel(labelId, { position: [lng, lat] });
  };
}

export default MapEx;
