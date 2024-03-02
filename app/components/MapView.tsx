import mapboxgl, { LngLatLike, Map } from "mapbox-gl";
import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM_LEVEL } from "../constants";
import MapEx from "../modules/MapEx";

let id = 0;

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type MapViewProps = {
  center?: LngLatLike;
  zoom?: number;
};

const MapView = forwardRef<Map, MapViewProps>(
  ({ center = DEFAULT_MAP_CENTER, zoom = DEFAULT_ZOOM_LEVEL }, ref) => {
    const [map, setMap] = useState<MapEx>();
    const { current: container } = useRef(`map-${++id}`);

    useImperativeHandle(ref, () => map, [map]);

    useEffect(() => {
      setMap(
        new MapEx({
          container,
          center,
          zoom,
        })
      );
    }, []);

    return (
      <div id={container} className="absolute top-0 bottom-0 w-full h-screen" />
    );
  }
);

MapView.displayName = "MapView";

export default memo(MapView);
