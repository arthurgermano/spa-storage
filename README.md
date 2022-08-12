# SPA Storage - Browser Storage Plugin for Svelte and Pinia

## Integrate easely with browser storage and forage!

SPA Storage makes it ease to send and retrieve information to browser storage and forage.
You can choose witch one to use and configure how it will behave.

## Test It
<a href="https://arthurgermano.github.io/spa-storage/" _target="blank">SPA Storage - testing</a>

## Index

- [SPA Storage - Browser Storage Plugin for Svelte and Pinia](#spa-storage---browser-storage-plugin-for-svelte-and-pinia)
  - [Integrate easely with browser storage and forage!](#integrate-easely-with-browser-storage-and-forage)
  - [Test It](#test-it)
  - [Index](#index)
  - [Features](#features)
  - [Install](#install)
    - [Example](#example)
      - [SVELTE USAGE](#svelte-usage)
      - [PINIA USAGE](#pinia-usage)
  - [Main Methods Exported and Signatures](#main-methods-exported-and-signatures)
    - [Storage Methods](#storage-methods)
    - [Svelte Methods](#svelte-methods)
    - [Pinia Methods](#pinia-methods)


## Features

- Ease Configuration
- Set Keys with Timeout 
- Set Keys with Encryption
- Key Chain of Expire Keys
- Integration with Svelte 
- Integration with Pinia - VueJS
- Simple Encryption of Information

## Install

To install SPA Storage Plugin on your app:

with npm

```bash
npm i spa-storage
```

### Example
 
```javascript

// importing spaStorage
import { spaStorage, svelteFunctions, piniaFunctions } from "spa-storage";

// starting forage to use IndexedDB
spaStorage.startForage(undefined, { name: "SS_MY_CUSTOM_NAME", storeName: "SS_CUSTOM_STORE_NAME" });

// starting storage to use localStorage
export { spaStorage, svelteFunctions, piniaFunctions };

```

Now to use it you have just to import it in your stores and use!

#### SVELTE USAGE
 
```javascript
// DEFINING APP STORE! It could be any store!
// importing spaStorage configured as above
import { writable } from "svelte/store";
import { assign } from "../helpers.js"; // same as cloneDeep from lodash
import { svelteFunctions as SF } from "./storage.js";

const STORAGE_KEY = "SS_APP_STORE";

const storeTemplate = {
  themeDark: false,
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

```

Now to retrieve the information - when you first load the app

```javascript

import { svelteFunctions as SF } from "./storage.js";
import appStore from "./app.js";

export let IS_READY = false;
export async function loadStores() {
  if (IS_READY) return true;

  try {
    // now that we have the store defined we can retrieve information from the browser navigator
    // this will load the information from the browser to the app store
    await SF.getSvelteStoreInStorage(appStore.store, appStore.STORAGE_KEY);
    IS_READY = true;
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { appStore };

```

#### PINIA USAGE

Pinia is a little more "simple" because it isn't as sofisticated as SVELTE

```javascript

// importing your store definition
import useAppStore from "./app.js";

// exporting for usage in the application
export const appStore = useAppStore();

// loading from browser information to the Pinia store
await getPiniaStoreInStorage(appStore, appStore.$id);

// now you can use subscribe to listen any changes and update the store automatically
// as below
await setPiniaStoreInStorage(
  appStore, 
  appStore.$id, 
  undefined, 
  [
    "header_options_opened",
    "menu_opened",
    "menu_filter",
  ]
);

```

## Main Methods Exported and Signatures

### Storage Methods

```javascript

// -----------------------------  startStorage  ---------------------------------------------------

function startStorage(config = {})
// config.encrypted - true or false
// config.expireKeysKey - the name of the key that will be used to store the expire keys
// config.checkExpiredKeysInterval - the interval in milliseconds to check for expired keys

// -----------------------------  startForage  ----------------------------------------------------

function startForage(config = {}, forageConfig)
// config.encrypted - true or false
// config.expireKeysKey - the name of the key that will be used to store the expire keys
// config.checkExpiredKeysInterval - the interval in milliseconds to check for expired keys

// forageConfig.name - the name of the database
// forageConfig.storeName - the name of the store
// forageConfig.version - the version of the database
// forageConfig.description - the description of the database

// -----------------------------  configure  ------------------------------------------------------

function configure(config = {}, forageConfig)

// -----------------------------  getItem  --------------------------------------------------------

function getItem (key) // retrieves a key from the browser storage
// key - key to retrieve

// -----------------------------  setItem  --------------------------------------------------------

async function setItem(key, value, time) // sets a key into the browser storage 
// key - key to set
// value - value to set
// time - time in milliseconds to expire the key - if not set will be forever

// -----------------------------  removeItem  -----------------------------------------------------

async function removeItem(key) // removes a key from the browser storage
// key - key to remove

// -----------------------------  getAll  ---------------------------------------------------------

async getAll() // retrieves all keys from the browser storage

// -----------------------------  clearExpireKeys  ------------------------------------------------

async clearExpireKeys() // clears all the expiration list and the keys

// -----------------------------  clearKeyList  ---------------------------------------------------

// clear a given array list of keys
// affects expiration key list and the keys
async function clearKeyList(keyList)

// -----------------------------  removeExpiredKeys  ----------------------------------------------

// Function to check and remove a key if expired
// If so... remove the key from the expiration list and the key
// IT IS CALLED AUTOMATICALLY EVERY INTERVAL SET BY CHECK_EXPIRED_KEYS_INTERVAL
async function removeExpiredKeys()


```

### Svelte Methods

```javascript

// -----------------------------  SvelteStorage  --------------------------------------------------
// -----------------------------  setSvelteStoreInStorage  ----------------------------------------

async function setSvelteStoreInStorage(
  store, // function to subscribe to the SVELTE store
  key, // key to be updated in the browser storage
  options: {
    timeout, // time in milliseconds to expire the key - if not set will be forever
    ignoreKeys = [] // array of keys to ignore when updating the browser storage - this will be as the keys never existed
  }
)

// -----------------------------  getSvelteStoreInStorage  ----------------------------------------

async function getSvelteStoreInStorage(store, key) // retrieves a key from the browser storage
// update - function to update the SVELTE store
// key - key to retrieve

// ------------------------------------------------------------------------------------------------
// -----------------------------  getStoreState  --------------------------------------------------

function getStoreState(store) // returns the current state of the SVELTE store

// ------------------------------------------------------------------------------------------------
// -----------------------------  getStoreKey  ----------------------------------------------------

function getStoreKey(store, key, ifEmpty) // returns the value of a key from the SVELTE store
// store - SVELTE store
// key - key to retrieve
// ifEmpty - value to return if the key is not found

// ------------------------------------------------------------------------------------------------
// -----------------------------  updateStoreKey  -------------------------------------------------

function updateStoreKey(store, objectKeyValue, storeStateSubstitute) // updates a key in the SVELTE store
// store - SVELTE store
// objectKeyValue - object with the key and value to update
// storeStateSubstitute - if informed will replace the store state with this value

```

### Pinia Methods

```javascript

// -----------------------------  PiniaStorage  ---------------------------------------------------
// -----------------------------  setPiniaStoreInStorage  -----------------------------------------

async function setPiniaStoreInStorage(
  store, // store to subscribe to the Pinia store
  key, // key to be updated in the browser storage
  options: {
    timeout, // time in milliseconds to expire the key - if not set will be forever
    ignoreKeys = [] // array of keys to ignore when updating the browser storage - this will be as the keys never existed
  }
) 

// -----------------------------  getPiniaStoreInStorage  -----------------------------------------

async function getPiniaStoreInStorage(store, key) // retrieves a key from the browser storage
// store - function to update the Pinia store
// key - key to retrieve


```