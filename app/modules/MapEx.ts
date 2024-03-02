import { Feature, Position } from "geojson";
import { uniq } from "lodash";
import { Expression, Map } from "mapbox-gl";
import { getStringColor } from "../utils";

type LabelOptions = {
  position: Position;
  text: string;
};

class MapEx extends Map {
  private featureId = 0;
  private labelId = 0;

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

  addFeatures(features: Feature[]) {
    const id = `feature-${++this.featureId}`;

    const colors = uniq(
      features.map(({ properties: { amenity } }) => amenity)
    ).reduce<string[]>((a, c) => (a.push(c, getStringColor(c)), a), []);

    const colorMap = [
      "match",
      ["get", "amenity"],
      ...colors,
      "black",
    ] as Expression;

    this.addSource(id, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features,
      },
    });

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
}

export default MapEx;
