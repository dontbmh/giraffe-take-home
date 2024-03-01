import { CreateAxiosDefaults } from "axios";
import { Feature } from "geojson";

export type ClientOptions = Pick<CreateAxiosDefaults, "headers" | "timeout">;

export interface Tags {
  [k: string]: string;
  name: string;
  amenity: string;
}

export type Element = Feature & {
  tags?: Tags;
};

export type OverpassResponse = {
  version: string;
  elements: Element[];
};
