import mapboxgl, { LngLatLike, Map } from "mapbox-gl";
import { forwardRef, memo, useImperativeHandle, useState } from "react";
import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM_LEVEL } from "../constants";
import useMountedEffect from "../hooks/useMountedEffect";
import MapEx from "../modules/MapEx";

const MAP_CONTAINER = "map";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type MapViewProps = {
  center?: LngLatLike;
  zoom?: number;
};

const MapView = forwardRef<Map, MapViewProps>(
  ({ center = DEFAULT_MAP_CENTER, zoom = DEFAULT_ZOOM_LEVEL }, ref) => {
    const [map, setMap] = useState<MapEx>();

    useImperativeHandle(ref, () => map, [map]);

    useMountedEffect(() => {
      setMap(
        new MapEx({
          container: MAP_CONTAINER,
          center,
          zoom,
        })
      );
    }, []);

    return (
      <div
        id={MAP_CONTAINER}
        className="absolute top-0 bottom-0 w-full h-screen"
      />
    );
  }
);

export default memo(MapView);
