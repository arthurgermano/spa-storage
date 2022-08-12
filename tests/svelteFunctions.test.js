import { describe, it, beforeEach, vi } from "vitest";
import { writable } from "svelte/store";
import { Window } from "happy-dom";
import * as svelteFunctions from "../functions/svelteFunctions";
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

let store = writable(assign({}, storeTemplate));

beforeEach(() => {
  store = writable(assign({}, storeTemplate));

  // storage functions
  storageFunctions.reset();
  localStorage = window.localStorage;
  localStorage.clear();

  // forage functions
  storageFunctions.reset();
  localforage.clear();
});

describe("svelteFunctions", () => {
  // storeFunctions()
  describe("getStoreState()", () => {
    it("getStoreState() to return the default value of the store", () => {
      expect(svelteFunctions.getStoreState(store)).toHaveProperty(
        "someKey",
        "someValue"
      );
      expect(svelteFunctions.getStoreState(store)).toHaveProperty(
        "someKey2",
        false
      );
    });

    // --------------------------------------------------------------------------------------------

    it("getStoreState() to throw an error when missing the store", () => {
      const resultFn = () => svelteFunctions.getStoreState();
      expect(resultFn).toThrow("SPA Storage: Store provided is not defined");
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("getStoreKey()", () => {
    it("getStoreKey() to return the default value of the store keys", () => {
      expect(svelteFunctions.getStoreKey(store, "someKey")).toBe("someValue");
      expect(svelteFunctions.getStoreKey(store, "someKey2")).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("getStoreKey() to throw an error when missing the store", () => {
      const resultFn = () => svelteFunctions.getStoreKey(undefined, "someKey");
      expect(resultFn).toThrow("SPA Storage: Store provided is not defined");
    });

    // --------------------------------------------------------------------------------------------

    it("getStoreKey() to return a default set value", () => {
      expect(svelteFunctions.getStoreKey(store, "someKey3", "someValue3")).toBe(
        "someValue3"
      );
    });

    // --------------------------------------------------------------------------------------------

    it("getStoreKey() to return a default set value when not defined to be undefined", () => {
      expect(svelteFunctions.getStoreKey(store, "someKey3")).toBeUndefined();
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("updateStoreKey()", () => {
    it("updateStoreKey() to update the store value", () => {
      svelteFunctions.updateStoreKey(store, { someKey: "valueUpdated" });

      expect(svelteFunctions.getStoreKey(store, "someKey")).toBe(
        "valueUpdated"
      );
      expect(svelteFunctions.getStoreKey(store, "someKey2")).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("updateStoreKey() to update the store value and rewrite the entire store", () => {
      svelteFunctions.updateStoreKey(
        store,
        { someKey: "valueUpdated" },
        { newStore: true }
      );

      expect(svelteFunctions.getStoreKey(store, "someKey")).toBe(
        "valueUpdated"
      );
      expect(svelteFunctions.getStoreKey(store, "newStore")).toBe(true);
      expect(svelteFunctions.getStoreKey(store, "someKey2")).toBeUndefined();
    });

    // --------------------------------------------------------------------------------------------

    it("updateStoreKey() to throw an error when missing the store", () => {
      const resultFn = () =>
        svelteFunctions.updateStoreKey(undefined, { someKey: "valueUpdated" });
      expect(resultFn).toThrow("SPA Storage: Store provided is not defined");
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("setSvelteStoreInStorage() with storage", () => {
    it("setSvelteStoreInStorage() to set the store in the storage and retrieve the same information", async () => {
      setStorageStore();
      await svelteFunctions.setSvelteStoreInStorage(store, "SPA_STORE_KEY");
      svelteFunctions.updateStoreKey(store, { someKey: "valueUpdated" }, {});
      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setSvelteStoreInStorage() to throw an error when store is not defined", async () => {
      setStorageStore();
      try {
        await svelteFunctions.setSvelteStoreInStorage(
          undefined,
          "SPA_STORE_KEY"
        );
      } catch (error) {
        expect(error.message).toBe("SPA Storage: Store provided is not defined");
        expect(storageFunctions.getStorageType()).toBe("STORAGE");
      }
    });

    // --------------------------------------------------------------------------------------------

    it("setSvelteStoreInStorage() to set the store and retrieve with getSvelteStoreInStorage() the same information", async () => {
      setStorageStore();
      await svelteFunctions.setSvelteStoreInStorage(store, "SPA_STORE_KEY");
      svelteFunctions.updateStoreKey(store, { someKey: "valueUpdated" }, {});
      await svelteFunctions.getSvelteStoreInStorage(store, "SPA_STORE_KEY");

      const result = svelteFunctions.getStoreState(store);
      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("getSvelteStoreInStorage() to not set the store when there is no key set in the storage", async () => {
      setStorageStore();
      svelteFunctions.updateStoreKey(store, { newKey: true }, {});
      await svelteFunctions.getSvelteStoreInStorage(store, "SPA_STORE_KEY");

      const result = svelteFunctions.getStoreState(store);
      expect(result).not.toHaveProperty("someKey", "someValue");
      expect(result).not.toHaveProperty("someKey2", false);
      expect(result).toHaveProperty("newKey", true);
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("getSvelteStoreInStorage() to return undefined with a non set key in the storage", async () => {
      setStorageStore();
      svelteFunctions.updateStoreKey(store, {}, {});
      const result = await svelteFunctions.getSvelteStoreInStorage(store, "SPA_STORE_KEY");
      expect(result).toBeUndefined();
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setSvelteStoreInStorage() to ignore keys set in the options", async () => {
      setStorageStore();
      await svelteFunctions.setSvelteStoreInStorage(store, "SPA_STORE_KEY", { ignoreKeys: ["someKey"] });
      svelteFunctions.updateStoreKey(store, { someKey: "valueUpdated" }, {});
      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      expect(result).not.toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setSvelteStoreInStorage() to set the store as an expire key in the storage", async () => {
      setStorageStore();
      await svelteFunctions.setSvelteStoreInStorage(store, "SPA_STORE_KEY", { timeout: 10000 });
      svelteFunctions.updateStoreKey(store, { someKey: "valueUpdated" }, {});
      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      const expiredKey = await storageFunctions.getItem(storageFunctions.getExpireKeysKey());

      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(expiredKey[0]).toHaveProperty("key", "SPA_STORE_KEY");
      expect(expiredKey[0]).toHaveProperty("liveUntil");
      expect(storageFunctions.getStorageType()).toBe("STORAGE");
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("setSvelteStoreInStorage() with FORAGE", () => {
    it("setSvelteStoreInStorage() to set the store in the storage and retrieve the same information", async () => {
      setForageStore();
      await svelteFunctions.setSvelteStoreInStorage(store, "SPA_STORE_KEY");
      svelteFunctions.updateStoreKey(store, { someKey: "valueUpdated" }, {});
      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setSvelteStoreInStorage() to throw an error when store is not defined", async () => {
      setForageStore();
      try {
        await svelteFunctions.setSvelteStoreInStorage(
          undefined,
          "SPA_STORE_KEY"
        );
      } catch (error) {
        expect(error.message).toBe("SPA Storage: Store provided is not defined");
        expect(storageFunctions.getStorageType()).toBe("FORAGE");
      }
    });

    // --------------------------------------------------------------------------------------------

    it("setSvelteStoreInStorage() to set the store and retrieve with getSvelteStoreInStorage() the same information", async () => {
      setForageStore();
      await svelteFunctions.setSvelteStoreInStorage(store, "SPA_STORE_KEY");
      svelteFunctions.updateStoreKey(store, { someKey: "valueUpdated" }, {});
      await svelteFunctions.getSvelteStoreInStorage(store, "SPA_STORE_KEY");

      const result = svelteFunctions.getStoreState(store);
      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("getSvelteStoreInStorage() to not set the store when there is no key set in the storage", async () => {
      setForageStore();
      svelteFunctions.updateStoreKey(store, { newKey: true }, {});
      await svelteFunctions.getSvelteStoreInStorage(store, "SPA_STORE_KEY");

      const result = svelteFunctions.getStoreState(store);
      expect(result).not.toHaveProperty("someKey", "someValue");
      expect(result).not.toHaveProperty("someKey2", false);
      expect(result).toHaveProperty("newKey", true);
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("getSvelteStoreInStorage() to return undefined with a non set key in the storage", async () => {
      setForageStore();
      svelteFunctions.updateStoreKey(store, {}, {});
      const result = await svelteFunctions.getSvelteStoreInStorage(store, "SPA_STORE_KEY");
      expect(result).toBeUndefined();
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setSvelteStoreInStorage() to ignore keys set in the options", async () => {
      setForageStore();
      await svelteFunctions.setSvelteStoreInStorage(store, "SPA_STORE_KEY", { ignoreKeys: ["someKey"] });
      svelteFunctions.updateStoreKey(store, { someKey: "valueUpdated" }, {});
      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      expect(result).not.toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });

    // --------------------------------------------------------------------------------------------

    it("setSvelteStoreInStorage() to set the store as an expire key in the storage", async () => {
      setForageStore();
      await svelteFunctions.setSvelteStoreInStorage(store, "SPA_STORE_KEY", { timeout: 10000 });
      svelteFunctions.updateStoreKey(store, { someKey: "valueUpdated" }, {});
      const result = await storageFunctions.getItem("SPA_STORE_KEY");
      const expiredKey = await storageFunctions.getItem(storageFunctions.getExpireKeysKey());

      expect(result).toHaveProperty("someKey", "someValue");
      expect(result).toHaveProperty("someKey2", false);
      expect(expiredKey[0]).toHaveProperty("key", "SPA_STORE_KEY");
      expect(expiredKey[0]).toHaveProperty("liveUntil");
      expect(storageFunctions.getStorageType()).toBe("FORAGE");
    });
  });
});
