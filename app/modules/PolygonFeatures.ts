import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawModeChangeEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import { Feature, Polygon } from "geojson";
import overpass from "../services/overpass";
import { getCenter } from "../utils";
import EventHandler from "./EventHandler";
import MapEx from "./MapEx";

type FeatureInfo = {
  name: string;
  labelId: string;
  featuresId: string;
};

type LabelGetter = (feature: Feature) => Promise<string>;

export type FeaturesData = {
  name: string;
  polygon: Polygon;
  features: Feature[];
};

export type FeaturesChangeEvent = {
  type: "create" | "update" | "delete";
  id: string;
  data?: FeaturesData;
};

class PolygonFeatures {
  public labelGetter: LabelGetter = async () => `Untitled`;
  public featuresChange = new EventHandler<FeaturesChangeEvent>();
  private featureMap: Record<string, FeatureInfo> = {};
  private draw: MapboxDraw;

  constructor(public map: MapEx) {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      defaultMode: "simple_select",
    });
    this.map.on("draw.modechange", this.handleModeChange);
    this.map.on("draw.create", this.handleDrawCreate);
    this.map.on("draw.update", this.handleDrawUpdate);
    this.map.on("draw.delete", this.handleDrawDelete);
    this.map.addControl(this.draw);
  }

  activateDraw() {
    this.draw.changeMode("draw_polygon");
    this.map.getCanvas().style.cursor = "crosshair";
  }

  deleteDraw(id: string) {
    const feature = this.draw.get(id);
    if (!feature) return;

    this.draw.delete(id);
    this.map.fire("draw.delete", {
      type: "draw.delete",
      features: [feature],
    });
  }

  private handleModeChange = ({ mode }: DrawModeChangeEvent) => {
    this.map.getCanvas().style.cursor =
      mode === "simple_select" ? "pointer" : "crosshair";
  };

  private handleDrawCreate = async ({
    features: [feature],
  }: DrawCreateEvent) => {
    const { id, geometry } = feature as Feature<Polygon>;
    const [name, featColl] = await Promise.all([
      this.labelGetter(feature),
      overpass.getFeatureCollection(geometry),
    ]);
    const { lng, lat } = getCenter(geometry);
    const labelId = this.map.addLabel({
      position: [lng, lat],
      text: name,
    });
    const featuresId = this.map.addFeatures(featColl);
    this.featureMap[id] = { name, labelId, featuresId };
    this.featuresChange.invoke({
      type: "create",
      id: `${id}`,
      data: {
        name,
        polygon: geometry,
        features: featColl.features,
      },
    });
  };

  private handleDrawUpdate = async ({
    features: [feature],
  }: DrawUpdateEvent) => {
    const { id, geometry } = feature as Feature<Polygon>;
    const info = this.featureMap[id];
    if (!info) return;

    const { lng, lat } = getCenter(geometry);
    this.map.updateLabel(info.labelId, { position: [lng, lat] });
    this.map.removeFeatures(info.featuresId);
    const featColl = await overpass.getFeatureCollection(geometry);
    const featuresId = this.map.addFeatures(featColl);
    this.featureMap[id] = { ...info, featuresId };
    this.featuresChange.invoke({
      type: "update",
      id: `${id}`,
      data: {
        name: info.name,
        polygon: geometry,
        features: featColl.features,
      },
    });
  };

  private handleDrawDelete = ({ features: [{ id }] }: DrawDeleteEvent) => {
    const info = this.featureMap[id];
    if (!info) return;

    delete this.featureMap[id];
    this.map.removeLabel(info.labelId);
    this.map.removeFeatures(info.featuresId);
    this.featuresChange.invoke({
      type: "delete",
      id: `${id}`,
    });
  };
}

export default PolygonFeatures;
