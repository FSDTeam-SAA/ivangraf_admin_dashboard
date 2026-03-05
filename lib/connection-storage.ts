export const ACTIVE_CONNECTION_ID_KEY = "ivangraf.active-connection-id";
export const CONNECTION_CHANGED_EVENT = "ivangraf:connection-changed";

export function getActiveConnectionId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_CONNECTION_ID_KEY);
}

export function setActiveConnectionId(connectionId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_CONNECTION_ID_KEY, connectionId);
  window.dispatchEvent(new Event(CONNECTION_CHANGED_EVENT));
}

export function clearActiveConnectionId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_CONNECTION_ID_KEY);
  window.dispatchEvent(new Event(CONNECTION_CHANGED_EVENT));
}