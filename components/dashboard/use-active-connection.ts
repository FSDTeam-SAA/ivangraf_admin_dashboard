"use client";

import * as React from "react";

import {
  CONNECTION_CHANGED_EVENT,
  getActiveConnectionId,
  setActiveConnectionId,
} from "@/lib/connection-storage";

export function useActiveConnection() {
  const [activeConnectionId, setLocalActiveConnectionId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const update = () => {
      setLocalActiveConnectionId(getActiveConnectionId());
    };

    update();
    window.addEventListener(CONNECTION_CHANGED_EVENT, update);
    return () => window.removeEventListener(CONNECTION_CHANGED_EVENT, update);
  }, []);

  const setActiveConnection = React.useCallback((connectionId: string) => {
    setActiveConnectionId(connectionId);
    setLocalActiveConnectionId(connectionId);
  }, []);

  return { activeConnectionId, setActiveConnection };
}