import { Geometry } from "geojson";
import { LngLatBounds, LngLatLike } from "mapbox-gl";

export const getCenter = (g: Geometry) => {
  const b = new LngLatBounds();

  switch (g.type) {
    case "Point":
      b.extend(g.coordinates as LngLatLike);
      break;
    case "MultiPoint":
    case "LineString":
      g.coordinates.forEach((e) => b.extend(e as LngLatLike));
      break;
    case "MultiLineString":
    case "Polygon":
      g.coordinates.flat().forEach((e) => b.extend(e as LngLatLike));
      break;
    case "MultiPolygon":
      g.coordinates.flat(2).forEach((e) => b.extend(e as LngLatLike));
      break;
    case "GeometryCollection":
      g.geometries.forEach((e) => b.extend(getCenter(e)));
      break;
  }

  return b.getCenter();
};
