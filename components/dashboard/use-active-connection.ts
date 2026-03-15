"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getActiveConnectionPreference,
  getMyConnections,
  updateActiveConnectionPreference,
} from "@/lib/api";
import {
  CONNECTION_CHANGED_EVENT,
  getActiveConnectionId,
  setActiveConnectionId,
} from "@/lib/connection-storage";
import { getErrorMessage } from "@/lib/error";

export function useActiveConnection() {
  const [activeConnectionId, setLocalActiveConnectionId] = React.useState<string | null>(
    () => getActiveConnectionId()
  );
  const [isConnectionReady, setIsConnectionReady] = React.useState(false);
  const [pendingConnectionId, setPendingConnectionId] = React.useState<string | null>(null);
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
    mutationFn: async (connectionId: string | null) => {
      const normalizedConnectionId = connectionId ? String(connectionId).trim() : null;
      return updateActiveConnectionPreference(normalizedConnectionId);
    },
    onMutate: async (nextConnectionId) => {
      setPendingConnectionId(nextConnectionId);
      setIsConnectionReady(false);

      await queryClient.cancelQueries({
        predicate: (query) => shouldResetOnConnectionChange(query.queryKey),
      });
    },
    onError: (error) => {
      setPendingConnectionId(null);
      setIsConnectionReady(true);
      toast.error(getErrorMessage(error, "Failed to update selected database"));
    },
    onSuccess: (response) => {
      const nextConnectionId = response.data?.activeConnectionId || null;
      setActiveConnectionId(nextConnectionId);
      setLocalActiveConnectionId(nextConnectionId);
      setPendingConnectionId(null);
      setIsConnectionReady(true);
      queryClient.setQueryData(["user", "active-connection"], response);
    },
  });

  const setActiveConnectionMutate = setActiveConnectionMutation.mutate;
  const isUpdatingConnection = setActiveConnectionMutation.isPending;

  React.useEffect(() => {
    if (!activeConnectionQuery.error) return;
    toast.error(getErrorMessage(activeConnectionQuery.error, "Failed to load selected database"));
  }, [activeConnectionQuery.error]);

  React.useEffect(() => {
    if (!connectionsQuery.error) return;
    toast.error(getErrorMessage(connectionsQuery.error, "Failed to load databases"));
  }, [connectionsQuery.error]);

  React.useEffect(() => {
    if (activeConnectionQuery.isLoading || connectionsQuery.isLoading) {
      return;
    }

    if (isUpdatingConnection) {
      return;
    }

    const availableConnections = connectionsQuery.data?.data || [];
    const persistedConnectionId = activeConnectionQuery.data?.data?.activeConnectionId || null;
    const persistedExists = persistedConnectionId
      ? availableConnections.some((connection) => connection.id === persistedConnectionId)
      : false;

    const nextConnectionId = persistedExists
      ? persistedConnectionId
      : availableConnections.length
        ? availableConnections[0].id
        : null;

    if (persistedConnectionId === nextConnectionId) {
      autoPersistedConnectionIdRef.current = null;
      if (getActiveConnectionId() !== nextConnectionId) {
        setActiveConnectionId(nextConnectionId);
      }
      setLocalActiveConnectionId(nextConnectionId);
      setIsConnectionReady(true);
      return;
    }

    if (autoPersistedConnectionIdRef.current !== nextConnectionId) {
      autoPersistedConnectionIdRef.current = nextConnectionId;
      setActiveConnectionMutate(nextConnectionId);
    }
  }, [
    activeConnectionQuery.data?.data?.activeConnectionId,
    activeConnectionQuery.isLoading,
    connectionsQuery.data?.data,
    connectionsQuery.isLoading,
    isUpdatingConnection,
    setActiveConnectionMutate,
  ]);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleConnectionChanged = () => {
      setLocalActiveConnectionId(getActiveConnectionId());
    };

    window.addEventListener(CONNECTION_CHANGED_EVENT, handleConnectionChanged);
    return () => {
      window.removeEventListener(CONNECTION_CHANGED_EVENT, handleConnectionChanged);
    };
  }, []);

  const setActiveConnection = React.useCallback(
    (connectionId: string) => {
      const normalizedConnectionId = String(connectionId || "").trim();
      if (!normalizedConnectionId) return;
      if (isUpdatingConnection) return;
      if (
        normalizedConnectionId === activeConnectionId ||
        normalizedConnectionId === pendingConnectionId
      ) {
        return;
      }

      autoPersistedConnectionIdRef.current = normalizedConnectionId;
      setIsConnectionReady(false);
      setActiveConnectionMutate(normalizedConnectionId);
    },
    [activeConnectionId, pendingConnectionId, isUpdatingConnection, setActiveConnectionMutate]
  );

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
    pendingConnectionId,
    isUpdatingConnection,
  };
}
