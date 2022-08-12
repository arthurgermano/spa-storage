import { toJSON, fromJSON, toCypher, fromCypher } from "./commonFunctions.js";
import localforage from "localforage";

// ------------------------------------------------------------------------------------------------

let SS;
let HAS_ENCRYPTION = false;
let EXPIRE_KEYS = "EXPIRE_KEYS";
let CHECK_EXPIRED_KEYS_INTERVAL = 5000;
let STORAGE_TYPE;
let INTERVAL_ID;

const forageDefaultConfig = {
  name: "SPAStorage",
  version: 1,
  storeName: "SPAStorage",
  description: "SPA Storage Plugin",
};

// -----------------------------  startStorage  ---------------------------------------------------

export function startStorage(config = {}) {
  config.storage = localStorage || null;
  configure(config);
};

// -----------------------------  startForage  ----------------------------------------------------

export function startForage(config = {}, forageConfig) {
  config.storage = localforage || null;
  configure(config, forageConfig);
};

// -----------------------------  configure  ------------------------------------------------------

export function configure(config = {}, forageConfig) {
  try {
    if (config.storage) {
      SS = config.storage;
    }
    checkStorage();
    setForageConfig(forageConfig);

    HAS_ENCRYPTION = config.encrypted || false;
    EXPIRE_KEYS = config.expireKeysKey || EXPIRE_KEYS;
    CHECK_EXPIRED_KEYS_INTERVAL =
      config.checkExpiredKeysInterval || CHECK_EXPIRED_KEYS_INTERVAL;

    // enabling the interval to check for expired keys every CHECK_EXPIRED_KEYS_INTERVAL milliseconds
    if (!INTERVAL_ID) {
      INTERVAL_ID = setInterval(() => {
        removeExpiredKeys();
      }, CHECK_EXPIRED_KEYS_INTERVAL);
    }

    return true;
  } catch (error) {
    throw error;
  }
}

// -----------------------------  hasEncryption  --------------------------------------------------

export function hasEncryption() {
  return HAS_ENCRYPTION;
}

// -----------------------------  getExpireKeysKey  -----------------------------------------------

export function getExpireKeysKey() {
  return EXPIRE_KEYS;
}

// -----------------------------  getCheckExpiredKeysInterval  ------------------------------------

export function getCheckExpiredKeysInterval() {
  return CHECK_EXPIRED_KEYS_INTERVAL;
}

// -----------------------------  getStorageType  -------------------------------------------------

export function getStorageType() {
  return STORAGE_TYPE;
}

// -----------------------------  getStorage  -----------------------------------------------------

export function getStorage() {
  return SS;
}

// -----------------------------  reset  ----------------------------------------------------------

export function reset() {
  SS = null;
  HAS_ENCRYPTION = false;
  EXPIRE_KEYS = "EXPIRE_KEYS";
  CHECK_EXPIRED_KEYS_INTERVAL = 5000;
  STORAGE_TYPE = null;
  if (INTERVAL_ID) {
    clearInterval(INTERVAL_ID);
    INTERVAL_ID = null;
  }
}

// -----------------------------  getItem  --------------------------------------------------------

export async function getItem(key) {
  try {
    if (!key) {
      return false;
    }
    await removeExpiredKeys();

    const item = await SS.getItem(key);
    if (!item) {
      return false;
    }

    return fromJSON(getFromEncryption(key, item));
  } catch (error) {
    throw error;
  }
}

// -----------------------------  setItem  --------------------------------------------------------

export async function setItem(key, value, time) {
  try {
    if (key === undefined || key === null || key.trim() === "") {
      return false;
    }
    key = key.trim();
    await removeExpiredKeys();

    if (value === undefined || value === null) {
      await SS.removeItem(key);
      return false;
    }

    if (time) {
      await addExpireKey(key, time);
    } else {
      await removeExpireKey(key, false);
    }
    await SS.setItem(key, setFromEncryption(key, toJSON(value)));

    return true;
  } catch (error) {
    throw error;
  }
}

// -----------------------------  removeItem  -----------------------------------------------------

export async function removeItem(key) {
  try {
    await removeExpiredKeys();
    let item = await SS.getItem(key);
    await removeExpireKey(key, false);
    if (item) {
      return fromJSON(getFromEncryption(key, item));
    }
    return true;
  } catch (error) {
    throw error;
  }
}

// -----------------------------  getAll  ---------------------------------------------------------

export async function getAll() {
  try {
    await removeExpiredKeys();
    const keys = await getKeysFromStorage();
    const items = [];
    for (let key of keys) {
      const item = await SS.getItem(key);
      items.push(fromJSON(getFromEncryption(key, item)));
    }
    return items;
  } catch (error) {
    throw error;
  }
}

// -----------------------------  removeExpiredKeys  ----------------------------------------------

export async function removeExpiredKeys() {
  try {
    checkStorage();
    let expireKeys = fromJSON(
      getFromEncryption(EXPIRE_KEYS, await SS.getItem(EXPIRE_KEYS))
    );
    if (!expireKeys || expireKeys.length === 0) {
      await SS.removeItem(EXPIRE_KEYS);
      return [];
    }

    let keysRemoved = [];

    expireKeys = await expireKeys.filter(async (expKey) => {
      // if key is expired, no point to maintain it in the storage
      const item = await SS.getItem(expKey.key);
      if (!item) {
        return false;
      }

      // checking if the key is expired
      const now = new Date().getTime();
      if (now > expKey.liveUntil) {
        await SS.removeItem(expKey.key);
        keysRemoved.push(expKey.key);
        return false;
      }

      // key is not expired, keep it in the storage
      return true;
    });

    if (expireKeys.length > 0) {
      await SS.setItem(
        EXPIRE_KEYS,
        setFromEncryption(EXPIRE_KEYS, toJSON(expireKeys))
      );
    } else {
      await SS.removeItem(EXPIRE_KEYS);
    }

    return keysRemoved;
  } catch (error) {
    throw error;
  }
}

// -----------------------------  removeExpireKey  ------------------------------------------------

export async function removeExpireKey(key, expireKeyOnly = true) {
  try {
    await removeExpiredKeys();

    let expireKeys = fromJSON(
      getFromEncryption(EXPIRE_KEYS, await SS.getItem(EXPIRE_KEYS))
    );
    if (!expireKeyOnly) {
      await SS.removeItem(key);
    }
    if (!expireKeys || expireKeys.length === 0) {
      return true;
    }

    expireKeys = expireKeys.filter((item) => item.key !== key);

    if (expireKeys && expireKeys.length > 0) {
      await SS.setItem(
        EXPIRE_KEYS,
        setFromEncryption(EXPIRE_KEYS, toJSON(expireKeys))
      );
    } else {
      await SS.removeItem(EXPIRE_KEYS);
    }

    return true;
  } catch (error) {
    throw error;
  }
}

// -----------------------------  clearExpireKeys  ------------------------------------------------

export async function clearExpireKeys(onlyExpireKeys = false) {
  try {
    checkStorage();
    let expireKeys = fromJSON(
      getFromEncryption(EXPIRE_KEYS, await SS.getItem(EXPIRE_KEYS))
    );

    if (!expireKeys || expireKeys.length === 0) {
      return true;
    }

    if (!onlyExpireKeys) {
      for (let item of expireKeys) {
        await SS.removeItem(item.key);
      }
    }
    await SS.removeItem(EXPIRE_KEYS);
    return true;
  } catch (error) {
    throw error;
  }
}

// -----------------------------  clearKeyList  ---------------------------------------------

export async function clearKeyList(keyList) {
  try {
    await removeExpiredKeys();
    if (!keyList || !Array.isArray(keyList) || keyList.length === 0) {
      return true;
    }

    for (let key of keyList) {
      await removeExpireKey(key, false);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

// ------------------------------------------------------------------------------------------------
// -----------------------------  NON EXPORTED FUNCTIONS ------------------------------------------
// ------------------------------------------------------------------------------------------------

// -----------------------------  getFromEncryption  ----------------------------------------------

function getFromEncryption(key, value) {
  if (!HAS_ENCRYPTION) {
    return value;
  }
  return fromCypher(key, value);
}

// -----------------------------  setFromEncryption  ----------------------------------------------

function setFromEncryption(key, value) {
  if (!HAS_ENCRYPTION) {
    return value;
  }
  return toCypher(key, value);
}

// -----------------------------  checkStorage  ---------------------------------------------------

function checkStorage() {
  if (!SS || typeof SS !== "object") {
    throw new Error("SPA Storage: Storage is not configured correctly");
  }
}

// -----------------------------  addExpireKey  ---------------------------------------------------

async function addExpireKey(key, time) {
  try {
    if (!checkTime(time)) {
      return false;
    }

    const liveUntil = new Date().getTime() + time;
    let expireKeys = fromJSON(
      getFromEncryption(EXPIRE_KEYS, await SS.getItem(EXPIRE_KEYS))
    );

    if (expireKeys) {
      expireKeys = expireKeys.filter((item) => item.key !== key);
      expireKeys.push({ key, liveUntil });
    } else {
      expireKeys = [{ key, liveUntil }];
    }

    await SS.setItem(
      EXPIRE_KEYS,
      setFromEncryption(EXPIRE_KEYS, toJSON(expireKeys))
    );
  } catch (error) {
    throw error;
  }
}

// -----------------------------  checkTime  ------------------------------------------------------

function checkTime(time) {
  if (
    !time ||
    !Number.isSafeInteger(time) ||
    !Number.isInteger(time) ||
    time <= 0
  ) {
    return false;
  }
  return true;
}

// -----------------------------  getKeysFromStorage ----------------------------------------------

async function getKeysFromStorage() {
  try {
    if (STORAGE_TYPE === "FORAGE") {
      return await SS.keys();
    }
    let keys = [];
    for (let i = 0; i < SS.length; i++) {
      keys.push(SS.key(i));
    }
    return keys;
  } catch (error) {
    throw error;
  }
}

// -----------------------------  setForageConfig  ------------------------------------------------

function setForageConfig(forageConfig = {}) {
  if (typeof SS.keys === "function") {
    STORAGE_TYPE = "FORAGE";
    SS.config({
      driver: SS.INDEXEDDB,
      name: forageConfig.name || forageDefaultConfig.name,
      version: forageConfig.version || forageDefaultConfig.version,
      storeName: forageConfig.storeName || forageDefaultConfig.storeName,
      description: forageConfig.description || forageDefaultConfig.description,
    });
    return;
  }

  STORAGE_TYPE = "STORAGE";
}
