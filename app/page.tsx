"use client";

import {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawSelectionChangeEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import { Polygon } from "geojson";
import { useCallback, useRef, useState } from "react";
import MapView from "./components/MapView";
import PolygonCreationDialog from "./components/PolygonCreationDialog";
import Toolbar, { ToolId } from "./components/Toolbar";
import useDialogDisplay from "./hooks/useDialogDisplay";
import MapEx from "./modules/MapEx";
import overpass from "./services/overpass";
import { Tags } from "./services/overpass/types";

export default function Home() {
  const mapRef = useRef<MapEx>(null);
  const { current: polygonToFeatures } = useRef<Record<string, string>>({});
  const [selection, setSelection] = useState<string[]>([]);
  const [features, setFeatures] = useState<Record<string, Tags[]>>({});
  const { show, ...dialog } = useDialogDisplay("Untitled");

  const handleDrawChange = useCallback(
    async ({
      type,
      features: [feature],
    }: DrawCreateEvent | DrawUpdateEvent | DrawDeleteEvent) => {
      if (type === "draw.update" || type === "draw.delete")
        mapRef.current.removeFeatures(polygonToFeatures[feature.id]);

      if (type !== "draw.delete") {
        try {
          const polygon = feature.geometry as Polygon;
          const features = await overpass.getFeatures(polygon);
          const id = mapRef.current.addFeatures(features);
          polygonToFeatures[feature.id] = id;
        } catch (error) {}
      }
    },
    []
  );

  const handleSelectionChange = useCallback(
    ({ features }: DrawSelectionChangeEvent) =>
      setSelection(features.map(({ id }) => `${id}`)),
    []
  );

  const handleToolClick = useCallback(
    async (id: ToolId) => {
      switch (id) {
        case "action-draw":
          mapRef.current.activateDraw();
          break;
        case "action-delete":
          selection.forEach((id) => mapRef.current.deleteDraw(id));
          setSelection([]);
      }
    },
    [selection]
  );

  const onRefChange = useCallback((map: MapEx) => {
    mapRef.current = map;
    if (!map) return;

    map.labelGetter = show;
    map.on("draw.create", handleDrawChange);
    map.on("draw.update", handleDrawChange);
    map.on("draw.delete", handleDrawChange);
    map.on("draw.selectionchange", handleSelectionChange);
  }, []);

  return (
    <main>
      <MapView ref={onRefChange} />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <Toolbar
          invisibility={selection.length ? [] : ["action-delete"]}
          onToolClick={handleToolClick}
        />
      </div>
      <PolygonCreationDialog {...dialog} />
    </main>
  );
}
