import axios, { AxiosInstance } from "axios";
import { FeatureCollection, Polygon } from "geojson";
import { ClientOptions, OverpassResponse } from "./types";

class Overpass {
  private client: AxiosInstance;

  constructor({ headers = {}, timeout = 10 * 1000 }: ClientOptions = {}) {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_OVERPASS_ENDPOINT,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...headers,
      },
      timeout,
    });
  }

  async getFeatureCollection({ coordinates }: Polygon) {
    const poly = coordinates
      .flat()
      .reduce<number[]>((a, [lng, lat]) => (a.push(lat, lng), a), [])
      .join(" ");

    const { data } = await this.client.post(
      "/interpreter",
      `data=${encodeURIComponent(`
      [out:json]
      [timeout:90]
      ;
      (
        node["amenity"]["name"](poly:"${poly}");
        way["amenity"](poly:"${poly}");
        relation["amenity"](poly:"${poly}");
        <;
      );
      convert item ::=::,::geom=geom(),_osm_type=type();
      out geom;`)}`
    );

    return xformToFeatures(data);
  }
}

const xformToFeatures = ({
  elements,
}: OverpassResponse): FeatureCollection => ({
  type: "FeatureCollection",
  features: elements
    .filter(({ tags }) => !!tags?.name)
    .map(({ tags, ...rest }) => ({
      ...rest,
      type: "Feature",
      properties: tags,
    })),
});

export default new Overpass();
