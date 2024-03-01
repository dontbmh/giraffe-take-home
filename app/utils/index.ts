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

export const randomColor = (s: string) => {
  let hash = 0;
  s.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });

  let colour = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, "0");
  }

  return colour;
};
