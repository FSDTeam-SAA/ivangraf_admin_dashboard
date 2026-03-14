"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { useDashboardActiveConnection } from "@/components/dashboard/active-connection-context";
import { getActiveConnectionPreference } from "@/lib/api";
import {
  CONNECTION_CHANGED_EVENT,
  getActiveConnectionId,
  setActiveConnectionId as persistActiveConnectionId,
} from "@/lib/connection-storage";

export function useConnectionSelection() {
  const context = useDashboardActiveConnection();
  const [activeConnectionId, setActiveConnectionId] = React.useState<string | null>(() => getActiveConnectionId());
  const [isConnectionReady, setIsConnectionReady] = React.useState(false);

  const activeConnectionQuery = useQuery({
    queryKey: ["user", "active-connection"],
    queryFn: getActiveConnectionPreference,
    refetchOnWindowFocus: true,
    enabled: !context,
  });

  React.useEffect(() => {
    if (context) return undefined;

    const syncConnectionState = () => {
      setActiveConnectionId(getActiveConnectionId());
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
  }, [context]);

  React.useEffect(() => {
    if (context) return;

    if (activeConnectionQuery.isLoading) {
      setIsConnectionReady(false);
      return;
    }

    const serverConnectionId = activeConnectionQuery.data?.data?.activeConnectionId ?? null;
    persistActiveConnectionId(serverConnectionId);
    setActiveConnectionId(serverConnectionId);
    setIsConnectionReady(true);
  }, [context, activeConnectionQuery.data?.data?.activeConnectionId, activeConnectionQuery.isLoading]);

  if (context) {
    return {
      activeConnectionId: context.activeConnectionId,
      isConnectionReady: context.isConnectionReady,
    };
  }

  return { activeConnectionId, isConnectionReady };
}
