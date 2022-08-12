import { describe, it, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia, defineStore } from "pinia";
import { Window } from "happy-dom";
import * as piniaFunctions from "../functions/piniaFunctions";
import * as storageFunctions from "../functions/storageFunctions.js";
import localforage from "localforage";

const window = new Window();
let localStorage = null;

global.structuredClone = vi.fn((val) => {
  return JSON.parse(JSON.stringify(val));
});

function assign(objA, objB) {
  return Object.assign(structuredClone(objA), structuredClone(objB));
}

function setStorageStore(options = {}) {
  storageFunctions.reset();
  localStorage = window.localStorage;
  localStorage.clear();

  return storageFunctions.configure({
    storage: localStorage,
    ...options,
  });
}

function setForageStore(options = {}) {
  storageFunctions.reset();
  localforage.clear();
  return storageFunctions.configure({
    storage: localforage,
    ...options,
  });
}

// ------------------------------------------------------------------------------------------------

const storeTemplate = {
  someKey: "someValue",
  someKey2: false,
};

let store;

beforeEach(() => {
  const pinia = createPinia();
  setActivePinia(pinia);
  store = defineStore({
    id: "SPA_TEST_STORE",
    state: () => ({ ...storeTemplate }),
    getters: {},
    actions: {},
  })();

  // storage functions
  storageFunctions.reset();
  localStorage = window.localStorage;
  localStorage.clear();

  // forage functions
  storageFunctions.reset();
  localforage.clear();
});

describe("piniaFunctions", () => {
  describe("setPiniaStoreInStorage() with storage", () => {
    it("setPiniaStoreInStorage() to set the store in the storage and retrieve the same information", async () => {
      setStorageStore();
      await piniaFunctions.setPiniaStoreInStorage(store, "SPA_STORE_KEY");
      store.$patch({ ...store, someKey: "valueUpdated" });

      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setPiniaStoreInStorage() to throw an error when store is not defined", async () => {
      setStorageStore();
      try {
        await piniaFunctions.setPiniaStoreInStorage(undefined, "SPA_STORE_KEY");
      } catch (error) {
        expect(error.message).toBe(
          "SPA Storage: Store provided is not defined"
        );
        expect(storageFunctions.getStorageType()).toBe("STORAGE");
      }
    });

    // --------------------------------------------------------------------------------------------

    it("setPiniaStoreInStorage() to set the store and retrieve with getPiniaStoreInStorage() the same information", async () => {
      setStorageStore();
      await piniaFunctions.setPiniaStoreInStorage(store, "SPA_STORE_KEY");
      store.$patch({ someKey: "valueUpdated" });
      await piniaFunctions.getPiniaStoreInStorage(store, "SPA_STORE_KEY");

      const result = store.$state;
      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("getPiniaStoreInStorage() to not set the store when there is no key set in the storage", async () => {
      setStorageStore();
      store.$patch({ newKey: true });
      delete store.$state.someKey;
      delete store.$state.someKey2;
      await piniaFunctions.getPiniaStoreInStorage(store, "SPA_STORE_KEY");

      const result = store.$state;
      expect(result).not.toHaveProperty("someKey", "someValue");
      expect(result).not.toHaveProperty("someKey2", false);
      expect(result).toHaveProperty("newKey", true);
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("getPiniaStoreInStorage() to return undefined with a non set key in the storage", async () => {
      setStorageStore();
      delete store.someKey;
      delete store.someKey2;
      store.$patch({});
      const result = await piniaFunctions.getPiniaStoreInStorage(
        store,
        "SPA_STORE_KEY"
      );
      expect(result).toBeUndefined();
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setPiniaStoreInStorage() to ignore keys set in the options", async () => {
      setStorageStore();
      await piniaFunctions.setPiniaStoreInStorage(store, "SPA_STORE_KEY", {
        ignoreKeys: ["someKey"],
      });
      delete store.someKey;
      store.$patch({ someKey: "valueUpdated" });
      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      expect(result).not.toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setPiniaStoreInStorage() to set the store as an expire key in the storage", async () => {
      setStorageStore();
      await piniaFunctions.setPiniaStoreInStorage(store, "SPA_STORE_KEY", {
        timeout: 10000,
      });
      store.$patch({ someKey: "valueUpdated" });
      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      const expiredKey = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );

      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(expiredKey[0]).toHaveProperty("key", "SPA_STORE_KEY");
      expect(expiredKey[0]).toHaveProperty("liveUntil");
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("setPiniaStoreInStorage() with FORAGE", () => {
    it("setPiniaStoreInStorage() to set the store in the storage and retrieve the same information", async () => {
      setForageStore();
      await piniaFunctions.setPiniaStoreInStorage(store, "SPA_STORE_KEY");
      store.$patch({ someKey: "valueUpdated" });
      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setPiniaStoreInStorage() to throw an error when store is not defined", async () => {
      setForageStore();
      try {
        await piniaFunctions.setPiniaStoreInStorage(undefined, "SPA_STORE_KEY");
      } catch (error) {
        expect(error.message).toBe(
          "SPA Storage: Store provided is not defined"
        );
        expect(storageFunctions.getStorageType()).toBe("FORAGE");
      }
    });

    // --------------------------------------------------------------------------------------------

    it("setPiniaStoreInStorage() to set the store and retrieve with getPiniaStoreInStorage() the same information", async () => {
      setForageStore();
      await piniaFunctions.setPiniaStoreInStorage(store, "SPA_STORE_KEY");
      store.$patch({ someKey: "valueUpdated" });
      await piniaFunctions.getPiniaStoreInStorage(store, "SPA_STORE_KEY");

      const result = store.$state;
      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("getPiniaStoreInStorage() to not set the store when there is no key set in the storage", async () => {
      setForageStore();
      store.$patch({ newKey: true });
      delete store.$state.someKey;
      delete store.$state.someKey2;
      await piniaFunctions.getPiniaStoreInStorage(store, "SPA_STORE_KEY");

      const result = store.$state;
      expect(result).not.toHaveProperty("someKey", "someValue");
      expect(result).not.toHaveProperty("someKey2", false);
      expect(result).toHaveProperty("newKey", true);
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("getPiniaStoreInStorage() to return undefined with a non set key in the storage", async () => {
      setForageStore();
      store.$patch({});
      const result = await piniaFunctions.getPiniaStoreInStorage(
        store,
        "SPA_STORE_KEY"
      );
      expect(result).toBeUndefined();
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setPiniaStoreInStorage() to ignore keys set in the options", async () => {
      setForageStore();
      await piniaFunctions.setPiniaStoreInStorage(store, "SPA_STORE_KEY", {
        ignoreKeys: ["someKey"],
      });
      store.$patch({ someKey: "valueUpdated" });
      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      expect(result).not.toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setPiniaStoreInStorage() to set the store as an expire key in the storage", async () => {
      setForageStore();
      await piniaFunctions.setPiniaStoreInStorage(store, "SPA_STORE_KEY", {
        timeout: 10000,
      });
      store.$patch({ someKey: "valueUpdated" });
      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      const expiredKey = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );

      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(expiredKey[0]).toHaveProperty("key", "SPA_STORE_KEY");
      expect(expiredKey[0]).toHaveProperty("liveUntil");
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });
  });
});
