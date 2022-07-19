import { isBefore, addMilliseconds } from "date-fns";
import { toJSON, fromJSON } from "./functions/commonFunctions.js";
import {
  getStoreState,
  updateStoreKey,
  getStoreKey,
} from "./functions/svelteFunctions";
import CryptoJS from "crypto-js";
const LS = localStorage;

let hasEncription = false;
let EXPIRE_KEYS = "EXPIRE_KEYS";
let CHECK_EXPIRED_KEYS_INTERVAL = 5000;

export default (options = {}) => {
  if (options.encrypted) {
    hasEncription = true;
  }

  EXPIRE_KEYS = options.EXPIRE_KEYS || EXPIRE_KEYS;
  CHECK_EXPIRED_KEYS_INTERVAL =
    options.CHECK_EXPIRED_KEYS_INTERVAL || CHECK_EXPIRED_KEYS_INTERVAL;

  return {
    getItem,
    setItem,
    removeItem,
    getAll,
    clearExpireKeys,
    clearKeyList,
    setSvelteStoreInStorage,
    getSvelteStoreInStorage,
    setPiniaStoreInStorage,
    getPiniaStoreInStorage,
    getStoreState,
    updateStoreKey,
    getStoreKey,
  };
};

// -----------------------------  getItem  --------------------------------------------------------

const getItem = async (key) => {
  try {
    await removeExpiredKeys();
    return fromJSON(fromCipher(key, await LS.getItem(key)));
  } catch (error) {
    throw error;
  }
};

// -----------------------------  setItem  --------------------------------------------------------

const setItem = async (key, value, time) => {
  try {
    if (key === undefined || key === null || key.trim() === "") {
      return false;
    }

    if (value === undefined || value === null) {
      await clearKeyList([key]);
      return;
    }
    await removeExpiredKeys();
    if (
      time &&
      Number.isSafeInteger(time) &&
      Number.isInteger(time) &&
      time > 0
    ) {
      await addExpireKey(key, time);
    }
    await LS.setItem(key, toCipher(key, toJSON(value)));
  } catch (error) {
    throw error;
  }
};

// -----------------------------  removeItem  -----------------------------------------------------

const removeItem = async (key) => {
  try {
    await removeExpiredKeys();
    const item = fromJSON(fromCipher(key, await LS.getItem(key)));
    if (item !== null && item !== undefined) {
      await LS.removeItem(key);
      await removeExpireKey(key);
    }
    return item;
  } catch (error) {
    throw error;
  }
};

// -----------------------------  getAll  ---------------------------------------------------------

const getAll = async () => {
  try {
    await removeExpiredKeys();
    const keys = await LS.keys();
    const items = [];
    for (let key of keys) {
      items.push(await LS.getItem(key));
      await LS.removeItem(key);
    }
    return items;
  } catch (error) {
    throw error;
  }
};

// -----------------------------  clearExpireKeys  ------------------------------------------------

// clear all the expiration list and the keys
const clearExpireKeys = async () => {
  try {
    const expire = fromJSON(
      fromCipher(EXPIRE_KEYS, await LS.getItem(EXPIRE_KEYS))
    );

    if (expire === null || expire === undefined) {
      return;
    }

    await expire.map(async (item) => await LS.removeItem(item.key));

    await LS.removeItem(EXPIRE_KEYS);
  } catch (error) {
    throw error;
  }
};

// -----------------------------  clearKeyList  ---------------------------------------------------

// clear a given array list of keys
// affects expiration key list and the keys
const clearKeyList = async (keyList) => {
  try {
    if (!Array.isArray(keyList) || keyList.length === 0) {
      return;
    }

    await keyList.map(async (key) => {
      if (await LS.getItem(key)) {
        await LS.removeItem(key);
        await removeExpireKey(key);
      }
    });

    // updating the remaining list keychain if it has left any item
    let expire = fromJSON(
      fromCipher(EXPIRE_KEYS, await LS.getItem(EXPIRE_KEYS))
    );
    if (expire === null || expire === undefined) {
      return;
    }

    expire = expire.filter((item) => !keyList.includes(item.key));
    if (expire.length > 0) {
      await LS.setItem(EXPIRE_KEYS, toCipher(EXPIRE_KEYS, toJSON(expire)));
    } else {
      await LS.removeItem(EXPIRE_KEYS);
    }
  } catch (error) {
    throw error;
  }
};

// -----------------------------  removeExpiredKeys  ----------------------------------------------

// Function to check and remove a key if expired
// If so... remove the key from the expiration list and the key
const removeExpiredKeys = async () => {
  try {
    let keyList = [];
    let expire = fromJSON(
      fromCipher(EXPIRE_KEYS, await LS.getItem(EXPIRE_KEYS))
    );

    if (expire && expire.length > 0) {
      expire = await expire.filter(async (item) => {
        if (
          isBefore(new Date(), new Date(item.liveUntil)) &&
          (await LS.getItem(item.key))
        ) {
          return true;
        }
        await LS.removeItem(item.key);
        keyList.push(item.key);
      });

      if (expire.length > 0) {
        await LS.setItem(EXPIRE_KEYS, toCipher(EXPIRE_KEYS, toJSON(expire)));
      } else {
        await LS.removeItem(EXPIRE_KEYS);
      }
    }
    return keyList;
  } catch (error) {
    throw error;
  }
};

// -----------------------------  SvelteStorage  --------------------------------------------------
// -----------------------------  setSvelteStoreInStorage  ----------------------------------------

const setSvelteStoreInStorage = async (
  subscribe,
  key,
  timeout,
  ignoreKeys = []
) => {
  try {
    const unsubscribe = subscribe(async (store) => {
      for (let iKeys of ignoreKeys) {
        store[iKeys] = undefined;
      }
      await setItem(key, store, timeout);
    });
    unsubscribe();
  } catch (error) {
    throw error;
  }
};

// -----------------------------  getSvelteStoreInStorage  ----------------------------------------

const getSvelteStoreInStorage = async (update, key) => {
  try {
    const storage = await getItem(key);
    if (!storage) {
      return;
    }
    update(() => {
      return Object.assign({}, structuredClone(storage));
    });
  } catch (error) {
    throw error;
  }
};

// -----------------------------  PiniaStorage  ---------------------------------------------------
// -----------------------------  setPiniaStoreInStorage  -----------------------------------------

const setPiniaStoreInStorage = async (
  $subscribe,
  key,
  timeout,
  ignoreKeys = []
) => {
  try {
    return $subscribe(async (mutation, state) => {
      if (!state) {
        return;
      }
      let stateProps = { ...state };
      for (let propKey in stateProps) {
        if (ignoreKeys.includes(propKey)) {
          stateProps[propKey] = undefined;
        }
      }
      await setItem(key, stateProps, timeout);
    });
  } catch (error) {
    throw error;
  }
};

// -----------------------------  getPiniaStoreInStorage  -----------------------------------------

const getPiniaStoreInStorage = async ($patch, key) => {
  try {
    const storage = await getItem(key);
    if (!storage) {
      return;
    }
    return $patch(Object.assign({}, structuredClone(storage)));
  } catch (error) {
    throw error;
  }
};

// ------------------------------------------------- ## BELOW THIS LINE CORE FUNCTIONS ONLY ## ------------------------------------------------------
// -----------------------------  addExpireKey  ---------------------------------------------------

// add a key in the expiration key list
// key: String
// time: In milliseconds
async function addExpireKey(key, time) {
  try {
    if (!Number.isInteger(time) || !Number.isSafeInteger(time)) {
      throw new Error("Time to add an expire key is not a safe integer");
    }

    let expire = fromJSON(
      fromCipher(EXPIRE_KEYS, await LS.getItem(EXPIRE_KEYS))
    );
    const liveUntil = addMilliseconds(new Date(), time);

    if (expire !== null && expire !== undefined) {
      expire = expire.filter((item) => item.key !== key);
      expire.push({ key, liveUntil });
    } else {
      expire = [{ key, liveUntil }];
    }

    await LS.setItem(EXPIRE_KEYS, toCipher(EXPIRE_KEYS, toJSON(expire)));
  } catch (error) {
    throw error;
  }
}

// -----------------------------  removeExpireKey  ------------------------------------------------

// removes a specific key from expiration key list, may remove the key too
// key: String
// expireKeyOnly: Boolean -- only = true for only remove from expireKey OR the key itseLS too
async function removeExpireKey(key, expireKeyOnly = true) {
  try {
    let expire = fromJSON(
      fromCipher(EXPIRE_KEYS, await LS.getItem(EXPIRE_KEYS))
    );
    if (expire === null || expire === undefined) {
      return;
    }

    expire = expire.filter((item) => item.key !== key);

    if (expire.length > 0) {
      await LS.setItem(EXPIRE_KEYS, toCipher(EXPIRE_KEYS, toJSON(expire)));
    } else {
      await LS.removeItem(EXPIRE_KEYS);
    }

    if (!expireKeyOnly && LS.getItem(key)) {
      await LS.removeItem(key);
    }
  } catch (error) {
    throw error;
  }
}

// -----------------------------  toCipher  -------------------------------------------------------

function toCipher(key, value) {
  if (!hasEncription || !key || !value) {
    return value;
  }
  return CryptoJS.AES.encrypt(value, key).toString();
}

// -----------------------------  fromCipher  -----------------------------------------------------

function fromCipher(key, value) {
  if (!hasEncription || !key || !value) {
    return value;
  }
  const bytes = CryptoJS.AES.decrypt(value, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// -----------------------------  IntervalRemoveKeys  ---------------------------------------------

setInterval(removeExpiredKeys, CHECK_EXPIRED_KEYS_INTERVAL);
