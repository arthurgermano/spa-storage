import { setItem, getItem } from "./storageFunctions.js";

// ------------------------------------------------------------------------------------------------
// -----------------------------  getStoreState  --------------------------------------------------

export const getStoreState = (store) => {
  try {
    checkStore(store);
    let storeState;
    const unsubscribe = store.subscribe((state) => {
      if (typeof state === "object" || Array.isArray(state)) {
        storeState = structuredClone(state);
        return;
      }
      storeState = state;
    });
    unsubscribe();
    return storeState;
  } catch (error) {
    throw error;
  }
};

// ------------------------------------------------------------------------------------------------
// -----------------------------  getStoreKey  ----------------------------------------------------

export const getStoreKey = (store, key, ifEmpty) => {
  try {
    const storeState = getStoreState(store);
    if (storeState && storeState[key] !== undefined) {
      return storeState[key];
    }
    return ifEmpty;
  } catch (error) {
    throw error;
  }
};

// ------------------------------------------------------------------------------------------------
// -----------------------------  updateStoreKey  -------------------------------------------------

export const updateStoreKey = (store, objectKeyValue, storeStateSubstitute) => {
  try {
    checkStore(store);
    store.update((storeState) => {
      return Object.assign(
        structuredClone(storeStateSubstitute || storeState),
        structuredClone(objectKeyValue)
      );
    });
  } catch (error) {
    throw error;
  }
};

// ------------------------------------------------------------------------------------------------
// -----------------------------  setSvelteStoreInStorage  ----------------------------------------

export async function setSvelteStoreInStorage(store, key, options = {}) {
  try {
    const storeState = getStoreState(store);
    for (let iKeys of options.ignoreKeys || []) {
      storeState[iKeys] = undefined;
    }
    return await setItem(key, storeState, options.timeout);
  } catch (error) {
    throw error;
  }
}

// ------------------------------------------------------------------------------------------------
// -----------------------------  getSvelteStoreInStorage  ----------------------------------------

export async function getSvelteStoreInStorage(store, key) {
  try {
    checkStore(store);
    const storage = await getItem(key);
    if (!storage) {
      return;
    }
    store.update(() => {
      return Object.assign({}, structuredClone(storage));
    });
    return true;
  } catch (error) {
    throw error;
  }
}

// ------------------------------------------------------------------------------------------------
// -----------------------------  checkStore  -----------------------------------------------------

function checkStore(store) {
  if (!store || !store.subscribe || !store.update) {
    throw new Error("SPA Storage: Store provided is not defined");
  }
}
