"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  ACTIVE_CONNECTION_ID_KEY,
  CONNECTION_CHANGED_EVENT,
  getActiveConnectionId,
  setActiveConnectionId,
} from "@/lib/connection-storage";

export function useActiveConnection() {
  const [activeConnectionId, setLocalActiveConnectionId] = React.useState<string | null>(null);
  const [isConnectionReady, setIsConnectionReady] = React.useState(false);
  const previousConnectionIdRef = React.useRef<string | null>(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const update = () => {
      setLocalActiveConnectionId(getActiveConnectionId());
      setIsConnectionReady(true);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ACTIVE_CONNECTION_ID_KEY) return;
      update();
    };

    update();
    window.addEventListener(CONNECTION_CHANGED_EVENT, update);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(CONNECTION_CHANGED_EVENT, update);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setActiveConnection = React.useCallback((connectionId: string) => {
    if (!connectionId) return;

    setActiveConnectionId(connectionId);
    setLocalActiveConnectionId(connectionId);
    setIsConnectionReady(true);
  }, []);

  React.useEffect(() => {
    if (!isConnectionReady || !activeConnectionId) {
      return;
    }

    if (previousConnectionIdRef.current === activeConnectionId) {
      return;
    }

    previousConnectionIdRef.current = activeConnectionId;
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["lists"] });
    void queryClient.invalidateQueries({ queryKey: ["details"] });
  }, [activeConnectionId, isConnectionReady, queryClient]);

  return { activeConnectionId, setActiveConnection, isConnectionReady };
}
