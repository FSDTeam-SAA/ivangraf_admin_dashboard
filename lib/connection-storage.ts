export const ACTIVE_CONNECTION_ID_KEY = "ivangraf.active-connection-id";
export const CONNECTION_CHANGED_EVENT = "ivangraf:connection-changed";

let activeConnectionId: string | null = null;
let initializedFromStorage = false;

function initializeFromStorage() {
  if (initializedFromStorage) return;
  initializedFromStorage = true;

  if (typeof window === "undefined") return;

  const rawStoredValue = window.localStorage.getItem(ACTIVE_CONNECTION_ID_KEY);
  const normalizedConnectionId = String(rawStoredValue || "").trim();
  activeConnectionId = normalizedConnectionId ? normalizedConnectionId : null;
}

export function getActiveConnectionId() {
  initializeFromStorage();
  return activeConnectionId;
}

export function setActiveConnectionId(connectionId: string | null) {
  initializeFromStorage();
  const normalizedConnectionId = String(connectionId || "").trim();
  activeConnectionId = normalizedConnectionId ? normalizedConnectionId : null;

  if (typeof window !== "undefined") {
    if (activeConnectionId) {
      window.localStorage.setItem(ACTIVE_CONNECTION_ID_KEY, activeConnectionId);
    } else {
      window.localStorage.removeItem(ACTIVE_CONNECTION_ID_KEY);
    }

    window.dispatchEvent(new Event(CONNECTION_CHANGED_EVENT));
  }
}

export function clearActiveConnectionId() {
  setActiveConnectionId(null);
}
