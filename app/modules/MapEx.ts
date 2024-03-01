import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawModeChangeEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import { Feature, FeatureCollection, Position } from "geojson";
import { uniq } from "lodash";
import { Expression, Map, MapboxOptions } from "mapbox-gl";
import pin from "../assets/pin.png";
import { getCenter, randomColor } from "../utils";

const imagePin = new Image();
imagePin.src = pin.src;

type LabelGetter = (feature: Feature) => Promise<string>;

type LabelOptions = {
  position: Position;
  text: string;
};

class MapEx extends Map {
  public labelGetter: LabelGetter = async () => `Untitled`;
  private draw: MapboxDraw;
  private featureId = 0;
  private labelId = 0;
  private labelMap: Record<string, string> = {};

  constructor(options?: MapboxOptions) {
    super(options);
    this.addImage("pin", imagePin);
  }

  //#region [ Draw Impl ]

  activateDraw() {
    if (!this.draw) {
      this.draw = new MapboxDraw({
        displayControlsDefault: false,
        defaultMode: "draw_polygon",
      });
      this.addControl(this.draw);
      this.on("draw.create", this.handleDrawCreate);
      this.on("draw.update", this.handleDrawUpdate);
      this.on("draw.delete", this.handleDrawDelete);
      this.on("draw.modechange", this.handleModeChange);
    } else {
      this.draw.changeMode("draw_polygon");
    }
    this.getCanvas().style.cursor = "crosshair";
  }

  deleteDraw(id: string) {
    const feature = this.draw.get(id);
    if (!feature) return;

    this.draw.delete(id);
    this.fire("draw.delete", {
      type: "draw.delete",
      features: [feature],
    });
  }

  //#endregion

  //#region [ Label Impl ]

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
      source: id,
      type: "symbol",
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

  //#endregion

  //#region [ Feature Impl ]

  addFeatures(data: FeatureCollection) {
    const id = `feature-${++this.featureId}`;

    const colors = uniq(
      data.features.map(({ properties: { amenity } }) => amenity)
    ).reduce<string[]>((a, c) => (a.push(c, randomColor(c)), a), []);

    const colorMap = [
      "match",
      ["get", "amenity"],
      ...colors,
      "black",
    ] as Expression;

    this.addSource(id, { type: "geojson", data });

    this.addLayer({
      id: `fill-${id}`,
      source: id,
      type: "fill",
      layout: {},
      paint: {
        "fill-color": colorMap,
      },
    });

    this.addLayer({
      id: `symbol-${id}`,
      source: id,
      type: "symbol",
      layout: {
        "text-field": ["get", "name"],
        "text-anchor": "center",
        "text-size": 12,
      },
      paint: {
        "text-color": colorMap,
        "text-halo-color": "#fff",
        "text-halo-width": 1,
      },
    });

    return id;
  }

  removeFeatures(id: string) {
    this.removeLayer(`fill-${id}`);
    this.removeLayer(`symbol-${id}`);
  }

  //#endregion

  //#region [ Event Handler ]

  private handleModeChange = ({ mode }: DrawModeChangeEvent) => {
    this.getCanvas().style.cursor =
      mode === "simple_select" ? "pointer" : "crosshair";
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
  };

  private handleDrawUpdate = ({ features: [feature] }: DrawUpdateEvent) => {
    const { lng, lat } = getCenter(feature.geometry);
    const labelId = this.labelMap[feature.id];
    this.updateLabel(labelId, { position: [lng, lat] });
  };

  private handleDrawDelete = ({ features: [feature] }: DrawDeleteEvent) => {
    const labelId = this.labelMap[feature.id];
    delete this.labelMap[feature.id];
    this.removeLabel(labelId);
  };

  //#endregion
}

export default MapEx;
