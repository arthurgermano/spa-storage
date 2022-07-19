// ------------------------------------------------------------------------------------------------
// -----------------------------  getStoreState  --------------------------------------------------

export const getStoreState = (store) => {
  try {
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
    return storeState[key] || ifEmpty;
  } catch (error) {
    throw error;
  }
};

// ------------------------------------------------------------------------------------------------
// -----------------------------  updateStoreKey  -------------------------------------------------

export const updateStoreKey = (store, objectKeyValue, storeStateSubstitute) => {
  try {
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
