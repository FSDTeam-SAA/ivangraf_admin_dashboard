"use client";

import * as React from "react";

import {
  CONNECTION_CHANGED_EVENT,
  getActiveConnectionId,
} from "@/lib/connection-storage";

export function useConnectionSelection() {
  const [activeConnectionId, setActiveConnectionId] = React.useState<string | null>(null);
  const [isConnectionReady, setIsConnectionReady] = React.useState(false);

  React.useEffect(() => {
    const syncConnectionState = () => {
      setActiveConnectionId(getActiveConnectionId());
      setIsConnectionReady(true);
    };

    syncConnectionState();

    if (typeof window === "undefined") {
      return undefined;
    }

    window.addEventListener(CONNECTION_CHANGED_EVENT, syncConnectionState);
    window.addEventListener("storage", syncConnectionState);

    return () => {
      window.removeEventListener(CONNECTION_CHANGED_EVENT, syncConnectionState);
      window.removeEventListener("storage", syncConnectionState);
    };
  }, []);

  return { activeConnectionId, isConnectionReady };
}
