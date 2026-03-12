"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getActiveConnectionPreference,
  getMyConnections,
  updateActiveConnectionPreference,
} from "@/lib/api";
import { getActiveConnectionId, setActiveConnectionId } from "@/lib/connection-storage";
import { getErrorMessage } from "@/lib/error";

export function useActiveConnection() {
  const [activeConnectionId, setLocalActiveConnectionId] = React.useState<string | null>(() => getActiveConnectionId());
  const [isConnectionReady, setIsConnectionReady] = React.useState(false);
  const previousConnectionIdRef = React.useRef<string | null>(null);
  const autoPersistedConnectionIdRef = React.useRef<string | null>(null);
  const queryClient = useQueryClient();

  const shouldResetOnConnectionChange = React.useCallback((queryKey: readonly unknown[]) => {
    const rootKey = typeof queryKey[0] === "string" ? queryKey[0] : null;
    return rootKey !== "user" && rootKey !== "connections";
  }, []);

  const activeConnectionQuery = useQuery({
    queryKey: ["user", "active-connection"],
    queryFn: getActiveConnectionPreference,
    refetchOnWindowFocus: true,
  });

  const connectionsQuery = useQuery({
    queryKey: ["connections"],
    queryFn: getMyConnections,
    refetchOnWindowFocus: true,
  });

  const setActiveConnectionMutation = useMutation({
    mutationFn: (connectionId: string | null) => updateActiveConnectionPreference(connectionId),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update selected database"));
    },
    onSuccess: (response) => {
      const nextConnectionId = response.data?.activeConnectionId || null;
      setActiveConnectionId(nextConnectionId);
      setLocalActiveConnectionId(nextConnectionId);
      setIsConnectionReady(true);
      queryClient.setQueryData(["user", "active-connection"], response);
    },
  });

  React.useEffect(() => {
    if (!activeConnectionQuery.error) return;
    toast.error(getErrorMessage(activeConnectionQuery.error, "Failed to load selected database"));
  }, [activeConnectionQuery.error]);

  React.useEffect(() => {
    if (!connectionsQuery.error) return;
    toast.error(getErrorMessage(connectionsQuery.error, "Failed to load databases"));
  }, [connectionsQuery.error]);

  React.useEffect(() => {
    if (activeConnectionQuery.isLoading || connectionsQuery.isLoading) return;

    const availableConnections = connectionsQuery.data?.data || [];
    const persistedConnectionId = activeConnectionQuery.data?.data?.activeConnectionId || null;
    const persistedExists = persistedConnectionId
      ? availableConnections.some((connection) => connection.id === persistedConnectionId)
      : false;

    let nextConnectionId: string | null = persistedExists ? persistedConnectionId : null;
    if (!nextConnectionId && availableConnections.length) {
      nextConnectionId = availableConnections[0].id;
    }

    if (persistedConnectionId === nextConnectionId) {
      autoPersistedConnectionIdRef.current = null;
    } else if (autoPersistedConnectionIdRef.current !== nextConnectionId) {
      autoPersistedConnectionIdRef.current = nextConnectionId;
      setActiveConnectionMutation.mutate(nextConnectionId);
    }

    setActiveConnectionId(nextConnectionId);
    setLocalActiveConnectionId(nextConnectionId);
    setIsConnectionReady(true);
  }, [
    activeConnectionQuery.data?.data?.activeConnectionId,
    activeConnectionQuery.isLoading,
    connectionsQuery.data?.data,
    connectionsQuery.isLoading,
    setActiveConnectionMutation,
  ]);

  const setActiveConnection = React.useCallback((connectionId: string) => {
    const normalizedConnectionId = String(connectionId || "").trim();
    if (!normalizedConnectionId) return;
    if (normalizedConnectionId === activeConnectionId) return;

    autoPersistedConnectionIdRef.current = normalizedConnectionId;
    setActiveConnectionId(normalizedConnectionId);
    setLocalActiveConnectionId(normalizedConnectionId);
    setIsConnectionReady(true);
    setActiveConnectionMutation.mutate(normalizedConnectionId);
  }, [activeConnectionId, setActiveConnectionMutation]);

  React.useEffect(() => {
    if (!isConnectionReady || !activeConnectionId) {
      return;
    }

    if (previousConnectionIdRef.current === activeConnectionId) {
      return;
    }

    previousConnectionIdRef.current = activeConnectionId;

    void queryClient.cancelQueries({
      predicate: (query) => shouldResetOnConnectionChange(query.queryKey),
    });

    queryClient.removeQueries({
      predicate: (query) => shouldResetOnConnectionChange(query.queryKey),
      type: "inactive",
    });

    void queryClient.invalidateQueries({
      predicate: (query) => shouldResetOnConnectionChange(query.queryKey),
      refetchType: "active",
    });
  }, [activeConnectionId, isConnectionReady, queryClient, shouldResetOnConnectionChange]);

  return {
    activeConnectionId,
    setActiveConnection,
    isConnectionReady,
    isUpdatingConnection: setActiveConnectionMutation.isPending,
  };
}
