import { setItem, getItem } from "./storageFunctions.js";

// ------------------------------------------------------------------------------------------------
// -----------------------------  setPiniaStoreInStorage  -----------------------------------------

export async function setPiniaStoreInStorage(store, key, options = {}) {
  try {
    checkStore(store);
    options.ignoreKeys = options.ignoreKeys || [];
    return new Promise((resolve, reject) => {
      store.$subscribe(async (mutation, state) => {
        try {
          if (!state) {
            return resolve(true);
          }
          
          let stateProps = { ...state };
          for (let propKey in stateProps) {
            if (options.ignoreKeys.includes(propKey)) {
              stateProps[propKey] = undefined;
            }
          }

          await setItem(key, stateProps, options.timeout);
          return resolve(true);
        } catch (error) {
          return reject(error);  
        }
      });

      store.$patch({ ...store.$state });
    });
  } catch (error) {
    throw error;
  }
}

// ------------------------------------------------------------------------------------------------
// -----------------------------  getPiniaStoreInStorage  -----------------------------------------

export async function getPiniaStoreInStorage(store, key) {
  try {
    checkStore(store);
    const storage = await getItem(key);
    if (!storage) {
      return;
    }
    store.$patch(Object.assign({}, structuredClone(storage)));
    return true;
  } catch (error) {
    throw error;
  }
}

// ------------------------------------------------------------------------------------------------
// -----------------------------  checkStore  -----------------------------------------------------

function checkStore(store) {
  if (!store || !store.$subscribe || !store.$patch) {
    throw new Error("SPA Storage: Store provided is not defined");
  }
}
