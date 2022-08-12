import { describe, it, beforeEach } from "vitest";
import { Window } from "happy-dom";
import * as storageFunctions from "../functions/storageFunctions";

const window = new Window();
let localStorage = null;

beforeEach(() => {
  storageFunctions.reset();
  localStorage = window.localStorage;
  localStorage.clear();
});

function setStore(options = {}) {
  storageFunctions.reset();
  localStorage = window.localStorage;
  localStorage.clear();

  return storageFunctions.configure({
    storage: localStorage,
    ...options,
  });
}

describe("storageFunctions", () => {
  // configure()
  describe("configure()", () => {
    it("configure storage with localStorage", () => {
      const result = storageFunctions.configure({
        storage: localStorage,
      });
      expect(result).toBe(true);
    });

    // --------------------------------------------------------------------------------------------

    it("configure storage with localStorage and encrypted", () => {
      storageFunctions.configure({
        storage: localStorage,
        encrypted: true,
      });
      expect(storageFunctions.hasEncryption()).toBe(true);
    });

    // --------------------------------------------------------------------------------------------

    it("configure storage with localStorage and encrypted missing to be false", () => {
      storageFunctions.configure({
        storage: localStorage,
      });
      expect(storageFunctions.hasEncryption()).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("configure storage with localStorage and EXPIRE_KEYS", () => {
      storageFunctions.configure({
        storage: localStorage,
        expireKeysKey: "EXPIRE_KEYS_TEST",
      });
      expect(storageFunctions.getExpireKeysKey()).toBe("EXPIRE_KEYS_TEST");
    });

    // --------------------------------------------------------------------------------------------

    it("configure storage with localStorage and EXPIRE_KEYS missing to be defaulted to EXPIRED_KEYS", () => {
      storageFunctions.configure({
        storage: localStorage,
      });
      expect(storageFunctions.getExpireKeysKey()).toBe("EXPIRE_KEYS");
    });

    // --------------------------------------------------------------------------------------------

    it("configure storage with localStorage and CHECK_EXPIRED_KEYS_INTERVAL", () => {
      storageFunctions.configure({
        storage: localStorage,
        checkExpiredKeysInterval: 2000,
      });
      expect(storageFunctions.getCheckExpiredKeysInterval()).toBe(2000);
    });

    // --------------------------------------------------------------------------------------------

    it("configure storage with localStorage and CHECK_EXPIRED_KEYS_INTERVAL missing to be defaulted to 5000", () => {
      storageFunctions.configure({
        storage: localStorage,
      });
      expect(storageFunctions.getCheckExpiredKeysInterval()).toBe(5000);
    });

    // --------------------------------------------------------------------------------------------

    it("configure storage with empty an expect to throw an exception with defined message", () => {
      const resultFn = () => storageFunctions.configure({});
      expect(resultFn).toThrow(
        "SPA Storage: Storage is not configured correctly"
      );
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("getItem()", () => {
    it("getItem with undefined key", async () => {
      setStore();
      const result = await storageFunctions.getItem();
      expect(result).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("getItem with not set key", async () => {
      setStore();
      const result = await storageFunctions.getItem("somekey");
      expect(result).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("getItem simple item - not an object or array", async () => {
      setStore();
      await localStorage.setItem("testKey", "testValue");
      const resultFn = await storageFunctions.getItem("testKey");
      expect(resultFn).toBe("testValue");
    });

    // --------------------------------------------------------------------------------------------
  });

  // --------------------------------------------------------------------------------------------

  describe("setItem()", () => {
    it("setItem() to return true when item was set", async () => {
      setStore();
      const result = await storageFunctions.setItem("testKey", "testValue");
      expect(result).toBe(true);
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() to return false when inform a wrong value", async () => {
      setStore();
      const result = await storageFunctions.setItem("testKey");
      expect(result).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() to return false when inform a wrong key", async () => {
      setStore();
      const result = await storageFunctions.setItem(undefined, "testValue");
      expect(result).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() to set a informed key with value", async () => {
      setStore();
      const result = await storageFunctions.setItem("testKey", "testValue");
      expect(result).toBe(true);
      expect(await localStorage.getItem("testKey")).toBe("testValue");
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() to set a boolean value with true", async () => {
      setStore();
      const result = await storageFunctions.setItem("testKey", true);
      expect(result).toBe(true);
      expect(await localStorage.getItem("testKey")).toBe(true);
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() to set a numeric value return a numeric value", async () => {
      setStore();
      const result = await storageFunctions.setItem("testKey", 15.2);
      expect(result).toBe(true);
      expect(await localStorage.getItem("testKey")).toBe(15.2);
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() with timeout and no keys set in expire keys", async () => {
      setStore();
      const result = await storageFunctions.setItem(
        "testKey",
        "testValue",
        5000
      );
      expect(result).toBe(true);
      expect(await storageFunctions.getItem("testKey")).toBe("testValue");

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      expect(expireKeys[0]).toHaveProperty("key", "testKey");
      expect(expireKeys[0]).toHaveProperty("liveUntil");
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() with two new timeout keys and no keys set in expire keys", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.setItem("testKey2", "testValue2", 5000);

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      expect(expireKeys.length).toBe(2);
    });
  });

  // --------------------------------------------------------------------------------------------

  describe("setItem() -> getItem()", () => {
    it("to set a informed key with value and retrieve that value", async () => {
      setStore();
      const result = await storageFunctions.setItem("testKey", "testValue");
      expect(result).toBe(true);
      const resultFn = await storageFunctions.getItem("testKey");
      expect(resultFn).toBe("testValue");
    });

    // --------------------------------------------------------------------------------------------

    it("to set a invalid value and not set this value at all", async () => {
      setStore();
      const result = await storageFunctions.setItem("testKey");
      expect(result).toBe(false);
      const resultFn = await storageFunctions.getItem("testKey");
      expect(resultFn).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("to set a informed key with value and retrieve that value with encryption enabled", async () => {
      setStore({ encrypted: true });
      const result = await storageFunctions.setItem("testKey", "testValue");
      expect(result).toBe(true);
      const resultFn = await storageFunctions.getItem("testKey");
      expect(resultFn).toBe("testValue");
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("removeItem()", () => {
    it("removeItem() to return true when item removed it was not set", async () => {
      setStore();
      const result = await storageFunctions.removeItem("testKey");
      expect(result).toBe(true);
    });

    // --------------------------------------------------------------------------------------------

    it("removeItem() to return the item when the item removed is set", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue");
      const result = await storageFunctions.removeItem("testKey");
      expect(result).toBe("testValue");
    });

    // --------------------------------------------------------------------------------------------

    it("removeItem() to return the item when the item removed is set and encryption is enabled", async () => {
      setStore({ encrypted: true });
      await storageFunctions.setItem("testKey", "testValue");
      const result = await storageFunctions.removeItem("testKey");
      expect(result).toBe("testValue");
    });

    // --------------------------------------------------------------------------------------------

    it("removeItem() to return the JSON item when encryption is enabled", async () => {
      setStore({ encrypted: true });
      await storageFunctions.setItem("testKey", { ok: true });
      const result = await storageFunctions.removeItem("testKey");
      expect(result.ok).toBe(true);
    });

    // --------------------------------------------------------------------------------------------

    it("removeItem() to return the JSON item when encryption is disabled", async () => {
      setStore();
      await storageFunctions.setItem("testKey", { ok: true });
      const result = await storageFunctions.removeItem("testKey");
      expect(result.ok).toBe(true);
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("getAll()", () => {
    it("getAll() to return an empty array when no items are set", async () => {
      setStore();
      const result = await storageFunctions.getAll();
      expect(result).toEqual([]);
    });

    // --------------------------------------------------------------------------------------------

    it("getAll() to return an array with all items when items are set", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue");
      await storageFunctions.setItem("testKey2", "testValue2");
      const result = await storageFunctions.getAll();
      expect(result).toEqual(["testValue", "testValue2"]);
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("setItem() -> removeExpiredKeys()", () => {
    // --------------------------------------------------------------------------------------------

    it("setItem() with two new timeout keys and no keys set in expire keys", async () => {
      setStore({ checkExpiredKeysInterval: 1000 });
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.setItem("testKey2", "testValue2", 5000);

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      expect(expireKeys.length).toBe(2);
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() set a timeout key and try to reach it after timeout occurred", async () => {
      setStore({ checkExpiredKeysInterval: 50 });
      await storageFunctions.setItem("testKey", "testValue", 100);
      const waitFunc = async () => {
        await new Promise((resolve) => setTimeout(resolve, 210));
      };
      await waitFunc();

      const item = await storageFunctions.getItem("testKey");
      expect(item).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() set a timeout key and try to reach it before timeout occurred", async () => {
      setStore({ checkExpiredKeysInterval: 50 });
      await storageFunctions.setItem("testKey", "testValue", 1000);
      const waitFunc = async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      };
      await waitFunc();

      const item = await storageFunctions.getItem("testKey");
      expect(item).toBe("testValue");
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("setItem() -> removeExpireKey()", () => {
    // --------------------------------------------------------------------------------------------

    it("setItem() with two new timeout keys and remove only from expire key storage", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.setItem("testKey2", "testValue2", 5000);
      await storageFunctions.removeExpireKey("testKey");

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      const item = await storageFunctions.getItem("testKey");
      expect(expireKeys.length).toBe(1);
      expect(item).toBe("testValue");
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() with two new timeout keys and remove from expire key with item from storage", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.setItem("testKey2", "testValue2", 5000);
      await storageFunctions.removeExpireKey("testKey", false);

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      const item = await storageFunctions.getItem("testKey");
      expect(expireKeys.length).toBe(1);
      expect(item).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() with one new timeout key and remove from expire key to return undefined", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.removeExpireKey("testKey", false);

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      const item = await storageFunctions.getItem("testKey");
      expect(expireKeys).toBe(false);
      expect(item).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() with one new timeout key and remove only from expire key to return undefined", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.removeExpireKey("testKey");

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      const item = await storageFunctions.getItem("testKey");
      expect(expireKeys).toBe(false);
      expect(item).toBe("testValue");
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("setItem() -> clearExpireKeys()", () => {
    // --------------------------------------------------------------------------------------------

    it("setItem() with two new timeout keys and clear expire keys with storage", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.setItem("testKey2", "testValue2", 5000);
      await storageFunctions.clearExpireKeys();

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      const item = await storageFunctions.getItem("testKey");
      expect(expireKeys).toBe(false);
      expect(item).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() with two new timeout keys and clear only expire keys with storage", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.setItem("testKey2", "testValue2", 5000);
      await storageFunctions.clearExpireKeys(true);

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      const item = await storageFunctions.getItem("testKey");
      const item2 = await storageFunctions.getItem("testKey2");
      expect(expireKeys).toBe(false);
      expect(item).toBe("testValue");
      expect(item2).toBe("testValue2");
    });

    // --------------------------------------------------------------------------------------------

    it("no keys set and clear expire keys to return true", async () => {
      setStore();
      const result = await storageFunctions.clearExpireKeys();
      expect(result).toBe(true);
    });
  });

  // ----------------------------------------------------------------------------------------------

  describe("setItem() -> clearKeyList()", () => {
    // --------------------------------------------------------------------------------------------

    it("setItem() with three new timeout keys and clear list of keys - item ONE should be deleted", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.setItem("testKey2", "testValue2", 5000);
      await storageFunctions.setItem("testKey3", "testValue3", 5000);
      await storageFunctions.clearKeyList(["testKey", "testKey3"]);

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      const item = await storageFunctions.getItem("testKey");
      expect(expireKeys.length).toBe(1);
      expect(item).toBe(false);
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() with three new timeout keys and clear list of keys - item TWO should NOT be deleted", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.setItem("testKey2", "testValue2", 5000);
      await storageFunctions.setItem("testKey3", "testValue3", 5000);
      await storageFunctions.clearKeyList(["testKey", "testKey3"]);

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      const item = await storageFunctions.getItem("testKey2");
      expect(expireKeys.length).toBe(1);
      expect(item).toBe("testValue2");
    });

    // --------------------------------------------------------------------------------------------

    it("setItem() with three new timeout keys and clear list of keys - item THREE should be deleted", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.setItem("testKey2", "testValue2", 5000);
      await storageFunctions.setItem("testKey3", "testValue3", 5000);
      await storageFunctions.clearKeyList(["testKey", "testKey3"]);

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      const item = await storageFunctions.getItem("testKey3");
      expect(expireKeys.length).toBe(1);
      expect(item).toBe(false);
    });
    
    // --------------------------------------------------------------------------------------------

    it("setItem() with three new timeout keys and clear list of keys - remaining expire key should be the SECOND ONE", async () => {
      setStore();
      await storageFunctions.setItem("testKey", "testValue", 5000);
      await storageFunctions.setItem("testKey2", "testValue2", 5000);
      await storageFunctions.setItem("testKey3", "testValue3", 5000);
      await storageFunctions.clearKeyList(["testKey", "testKey3"]);

      const expireKeys = await storageFunctions.getItem(
        storageFunctions.getExpireKeysKey()
      );
      expect(expireKeys[0]).toHaveProperty("key", "testKey2");
      expect(expireKeys[0]).toHaveProperty("liveUntil");
    });
  });
});
