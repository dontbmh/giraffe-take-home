"use client";

import { DrawSelectionChangeEvent } from "@mapbox/mapbox-gl-draw";
import { useCallback, useEffect, useRef, useState } from "react";
import FeaturesDataDialog from "./components/FeaturesDataDialog";
import MapView from "./components/MapView";
import PolygonCreationDialog from "./components/PolygonCreationDialog";
import Toolbar, { ToolId } from "./components/Toolbar";
import useDialogInput from "./hooks/useDialogInput";
import MapEx from "./modules/MapEx";
import PolygonFeatures, {
  FeaturesChangeEvent,
  FeaturesData,
} from "./modules/PolygonFeatures";

type FeaturesCache = Record<string, FeaturesData>;

export default function Home() {
  const toolRef = useRef<PolygonFeatures>();
  const [tableOpen, setTableOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [features, setFeatures] = useState<FeaturesCache>({});
  const { show, ...dialog } = useDialogInput("Untitled");
  const currentFeatures = features[selectedId];

  const handleFeatureLocate = useCallback(
    (id: string) => toolRef.current.zoomToFeature(id, selectedId),
    [selectedId]
  );

  const handleFeaturesChange = useCallback(
    ({ type, id, data }: FeaturesChangeEvent) => {
      switch (type) {
        case "create":
        case "update":
          setFeatures((prev) => ({
            ...prev,
            [id]: data,
          }));
          break;
        case "delete":
          setFeatures((prev) => ({
            ...prev,
            [id]: null,
          }));
          break;
      }
    },
    []
  );

  const handleSelectionChange = useCallback(
    ({ features: [feature] }: DrawSelectionChangeEvent) =>
      setSelectedId(feature ? `${feature.id}` : null),
    []
  );

  const handleToolClick = useCallback(
    async (id: ToolId) => {
      switch (id) {
        case "action-draw":
          toolRef.current.activateDraw();
          break;
        case "action-delete":
          toolRef.current.deleteDraw(selectedId);
          setSelectedId(null);
          break;
        case "action-table":
          setTableOpen(true);
          break;
      }
    },
    [selectedId]
  );

  const onRefChange = useCallback((map: MapEx) => {
    if (!map) return;

    const tool = new PolygonFeatures(map);
    tool.labelGetter = show;
    tool.featuresChange.add(handleFeaturesChange);
    tool.map.on("draw.selectionchange", handleSelectionChange);
    toolRef.current = tool;
  }, []);

  useEffect(() => {
    if (!selectedId) setTableOpen(false);
  }, [selectedId]);

  return (
    <main>
      <MapView ref={onRefChange} />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <Toolbar
          invisibility={selectedId ? [] : ["action-delete", "action-table"]}
          onToolClick={handleToolClick}
        />
      </div>
      <PolygonCreationDialog {...dialog} />
      {!!currentFeatures && (
        <FeaturesDataDialog
          data={currentFeatures}
          open={tableOpen}
          onClose={() => setTableOpen(false)}
          onLocate={handleFeatureLocate}
        />
      )}
    </main>
  );
}
