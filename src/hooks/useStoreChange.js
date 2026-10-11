import { useSyncExternalStore } from "react";
import { subscribeStore, getStoreRevision } from "../utils/storeEvents";

export function useStoreChange() {
  return useSyncExternalStore(
    subscribeStore,
    getStoreRevision,
    getStoreRevision,
  );
}
