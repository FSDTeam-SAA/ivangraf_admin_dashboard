"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Database, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { useDashboardActiveConnection } from "@/components/dashboard/active-connection-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMyConnections, runSyncNow } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function DatabaseSkeleton() {
  return (
    <Card className="bg-[#fff6ea]">
      <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-7 w-3/5" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const queryClient = useQueryClient();
  const activeConnectionState = useDashboardActiveConnection();
  const {
    activeConnectionId,
    setActiveConnection,
    isConnectionReady,
    pendingConnectionId,
    isUpdatingConnection,
  } = activeConnectionState || {
    activeConnectionId: null,
    setActiveConnection: () => {},
    isConnectionReady: false,
    pendingConnectionId: null,
    isUpdatingConnection: false,
  };

  const connectionsQuery = useQuery({
    queryKey: ["connections"],
    queryFn: getMyConnections,
  });

  const syncMutation = useMutation({
    mutationFn: runSyncNow,
    onSuccess: (result) => {
      const synced = result.data?.synced || {};
      const totalRows = Object.values(synced).reduce((acc, value) => acc + Number(value || 0), 0);

      toast.success(`Sync completed. ${totalRows} rows processed.`);
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Sync failed"));
    },
  });

  React.useEffect(() => {
    if (!isConnectionReady) {
      return;
    }

    const list = connectionsQuery.data?.data || [];
    if (!list.length) {
      return;
    }

    const activeConnectionExists = activeConnectionId
      ? list.some((connection) => connection.id === activeConnectionId)
      : false;

    if (activeConnectionExists) {
      return;
    }

    setActiveConnection(list[0].id);
  }, [activeConnectionId, connectionsQuery.data?.data, isConnectionReady, setActiveConnection]);

  React.useEffect(() => {
    if (!connectionsQuery.error) return;
    toast.error(getErrorMessage(connectionsQuery.error, "Failed to load databases"));
  }, [connectionsQuery.error]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Databases"
        description="Select a database, then use sidebar analytics and list reports."
      />

      {connectionsQuery.isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <DatabaseSkeleton />
          <DatabaseSkeleton />
          <DatabaseSkeleton />
        </div>
      ) : null}

      {!connectionsQuery.isLoading && !connectionsQuery.data?.data.length ? (
        <Card className="bg-[#fff6ea]">
          <CardContent className="space-y-3 p-8 text-center">
            <p className="text-xl font-semibold text-[#2f2a21]">No database found</p>
            <p className="text-sm text-[#6f6146]">
              Add a connection from backend first, then refresh this page.
            </p>
            <Button variant="soft" onClick={() => connectionsQuery.refetch()}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!connectionsQuery.isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {(connectionsQuery.data?.data || []).map((database, index) => {
            const isActive = activeConnectionId === database.id;
            const isPendingSelection = pendingConnectionId === database.id;
            const isMerged = database.kind === "merged" || Boolean(database.isMerged);
            const sourceCount = database.sourceConnectionCount || database.sourceConnectionIds?.length || 0;

            return (
              <Card
                key={database.id}
                className={cn(
                  "bg-[#fff6ea]",
                  index === 2 ? "md:col-span-2" : "",
                  isActive ? "ring-2 ring-[#c99636]" : ""
                )}
              >
                <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1dfbb]">
                      <Database className="h-6 w-6 text-[#c98c1f]" />
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f7e9] px-3 py-1 text-xs font-semibold text-[#199849]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-[#2f2a21]">{database.label || database.database}</p>
                      {isMerged ? (
                        <span className="inline-flex items-center rounded-full border border-[#c7c2f0] bg-[#f3f1ff] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5650a4]">
                          Merged
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[#7b6a48]">
                      {isMerged
                        ? `Sources: ${sourceCount} - ${database.database}`
                        : `${database.host || "-"}:${database.port || "-"} - ${database.database}`}
                    </p>
                    <p className="mt-2 text-xs text-[#7b6a48]">
                      {isMerged
                        ? "Merged database (read-only source aggregate)"
                        : `Last Sync: ${formatDate(database.lastSyncAt)}`}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant={isActive || isPendingSelection ? "gold" : "soft"}
                      disabled={isUpdatingConnection || (isActive && !isPendingSelection)}
                      onClick={() => {
                        setActiveConnection(database.id);
                      }}
                    >
                      {isPendingSelection ? "Selecting..." : isActive ? "Selected" : "Select"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={syncMutation.isPending || !isActive || isMerged}
                      onClick={() => syncMutation.mutate()}
                    >
                      {isMerged
                        ? "Sync sources"
                        : syncMutation.isPending && isActive
                          ? "Syncing..."
                          : "Run Sync"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
