import axios from "axios";
import { getSession } from "next-auth/react";

import { getActiveConnectionId } from "@/lib/connection-storage";
import { getBaseUrl } from "@/lib/env";

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const session = await getSession();
    const token = session?.accessToken;
    const connectionId = getActiveConnectionId();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (connectionId) {
      config.headers["x-connection-id"] = connectionId;
    }
  }

  return config;
});

export const publicApiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});