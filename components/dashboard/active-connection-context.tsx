"use client";

import * as React from "react";

import { useActiveConnection } from "@/components/dashboard/use-active-connection";

type ActiveConnectionContextValue = ReturnType<typeof useActiveConnection>;

const ActiveConnectionContext = React.createContext<ActiveConnectionContextValue | null>(null);

interface ActiveConnectionProviderProps {
  children: React.ReactNode;
}

export function ActiveConnectionProvider({ children }: ActiveConnectionProviderProps) {
  const value = useActiveConnection();
  return (
    <ActiveConnectionContext.Provider value={value}>
      {children}
    </ActiveConnectionContext.Provider>
  );
}

export function useDashboardActiveConnection() {
  return React.useContext(ActiveConnectionContext);
}
