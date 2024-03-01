"use client";

import { useCallback, useRef, useState } from "react";
import MapView from "./components/MapView";
import PolygonCreationDialog from "./components/PolygonCreationDialog";
import Toolbar, { ToolId } from "./components/Toolbar";
import useDialogDisplay from "./hooks/useDialogDisplay";
import MapEx from "./modules/MapEx";

export default function Home() {
  const mapRef = useRef<MapEx>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const { show, ...dialog } = useDialogDisplay("Untitled");

  const handleToolClick = useCallback(
    async (id: ToolId) => {
      switch (id) {
        case "action-draw":
          mapRef.current.activateDraw();
          break;
        case "action-delete":
          selection.forEach((id) => mapRef.current.deleteDraw(id));
      }
    },
    [selection]
  );

  const onRefChange = useCallback((map: MapEx) => {
    mapRef.current = map;
    if (!map) return;

    map.labelGetter = show;
    map.selectionChange.add(setSelection);
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
