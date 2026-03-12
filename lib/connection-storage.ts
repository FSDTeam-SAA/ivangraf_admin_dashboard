export const ACTIVE_CONNECTION_ID_KEY = "ivangraf.active-connection-id";
export const CONNECTION_CHANGED_EVENT = "ivangraf:connection-changed";

let activeConnectionId: string | null = null;

export function getActiveConnectionId() {
  return activeConnectionId;
}

export function setActiveConnectionId(connectionId: string | null) {
  const normalizedConnectionId = String(connectionId || "").trim();
  activeConnectionId = normalizedConnectionId ? normalizedConnectionId : null;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONNECTION_CHANGED_EVENT));
  }
}

export function clearActiveConnectionId() {
  setActiveConnectionId(null);
}
