import { writable } from "svelte/store";
import { assign } from "../helpers.js";
import { svelteFunctions as SF } from "./storage.js";

const STORAGE_KEY = "SS_APP_STORE";

const storeTemplate = {
  themeDark: false,
  textSample: "SPA Storage is amazing and easy to use! :)",
};

const store = writable(assign({}, storeTemplate));

// ------------------------------------------------------------------------------------------------
// --------------  darkTheme Property  ------------------------------------------------------------

async function setThemeDark(themeDark) {
  SF.updateStoreKey(store, { themeDark });
  await SF.setSvelteStoreInStorage(store, STORAGE_KEY);
}

function getThemeDark() {
  return SF.getStoreKey(store, "themeDark");
}

// ------------------------------------------------------------------------------------------------
// --------------  textSample Property  -----------------------------------------------------------

async function setTextSample(textSample) {
  SF.updateStoreKey(store, { textSample });
  await SF.setSvelteStoreInStorage(store, STORAGE_KEY);
}

function getTextSample() {
  return SF.getStoreKey(store, "textSample");
}

// ------------------------------------------------------------------------------------------------

export default {
  STORAGE_KEY,
  store,
  subscribe: store.subscribe,
  update: store.update,
  setThemeDark,
  getThemeDark,
  setTextSample,
  getTextSample,
};
