import axios from "axios";
import { getSession } from "next-auth/react";

import { getBaseUrl } from "@/lib/env";

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
  config.headers.Pragma = "no-cache";
  config.headers.Expires = "0";

  const method = String(config.method || "get").toLowerCase();
  if (method === "get") {
    const cacheBuster = Date.now();
    if (config.params instanceof URLSearchParams) {
      config.params.set("_ts", String(cacheBuster));
    } else {
      config.params = {
        ...(config.params || {}),
        _ts: cacheBuster,
      };
    }
  }

  if (typeof window !== "undefined") {
    const session = await getSession();
    const token = session?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
