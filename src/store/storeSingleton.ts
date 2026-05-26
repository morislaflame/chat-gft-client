import type { IStoreContext } from "@/store/context";

let storeInstance: IStoreContext | null = null;

export function registerStoreInstance(stores: IStoreContext): void {
  storeInstance = stores;
}

export function getStore(): IStoreContext {
  if (!storeInstance) {
    throw new Error("Store not initialized");
  }
  return storeInstance;
}
