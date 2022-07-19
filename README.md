# One Storage - Browser Storage Plugin for Svelte and Pinia

## Integrate easely with browser storage and forage!

One Storage makes it ease to send and retrieve information to browser storage and forage.
You can choose witch one to use and configure how it will behave.
FORAGE is default!

## Index

- [One Storage - Browser Storage Plugin for Svelte and Pinia](#one-storage---browser-storage-plugin-for-svelte-and-pinia)
  - [Integrate easely with browser storage and forage!](#integrate-easely-with-browser-storage-and-forage)
  - [Index](#index)
  - [Features](#features)
  - [Install](#install)
    - [Example](#example)
      - [SVELTE USAGE](#svelte-usage)
      - [PINIA USAGE](#pinia-usage)
  - [Methods Exported and Signatures](#methods-exported-and-signatures)


## Features

- Ease Configuration
- Set Keys with Timeout 
- Key Chain of Expire Keys
- Integration with Svelte 
- Integration with Pinia - VueJS
- Simple Encryption of Information

## Install

To install Svelte Router on your svelte app:

with npm

```bash
npm i one-storage
```

### Example
 
```javascript
// importing oneStorage
import oneStorage from "one-storage";

// configure options
const STORE = oneStorage("forage", {
  encrypted: true,
  IDX_DB_NAME: `OS_DB_`,
  IDX_DB_STORE: `OS_IDX_STORE_`,
  EXPIRE_KEYS: `OS_EXPIRE_KEYS`,
  VERSION: 1,
  DESCRIPTION: `OS_DB_DESCRIPTOR_1`,
  CHECK_EXPIRED_KEYS_INTERVAL: 5000,
});

// export it as simple as that!
export default STORE;

```

Now to use it you have just to import it in your stores and use!

#### SVELTE USAGE
 
```javascript
// DEFINING APP STORE! It could be any store!
// importing oneStorage configured as above
import OS from "./storage.js";

const STORAGE_KEY = "APP_STORE";

const storeTemplate = {
  menuOpened: false,
  themeDark: false,
};

const store = writable(structuredClone(storeTemplate));

// ------------------------------------------------------------------------------------------------
// --------------  darkTheme Property  ------------------------------------------------------------

async function setThemeDark(themeDark) {

  // this is just a shortcut to update a key inside SVELTE STORE - doesn't update the key into 
  // the browser value
  OS.updateStoreKey(store, { themeDark });
  
  // THIS updates the value inside the storage chosen - FORAGE is default!
  await OS.setSvelteStoreInStorage(store.subscribe, STORAGE_KEY, undefined, [
    "menuOpened",
  ]);
}

function getThemeDark() {
  return OS.getStoreKey(store, "themeDark");
}

// ------------------------------------------------------------------------------------------------

```

Now to retrieve the information - when you first load the app

```javascript

import OS from "../storage.js";

// importing store defined above..
import appStr from "./app/index.js";

// defining a better naming after import
// this file in this example will contain all stores of the application
export const appStore = { ...appStr };


// now that we have the store defined we can retrieve information from the browser navigator
// this will load the information from the browser to the app store
await OS.getSvelteStoreInStorage(appStr.update, appStr.STORAGE_KEY);

```

#### PINIA USAGE

Pinia is a little more "simple" because it isn't as sofisticated as SVELTE

```javascript

// importing your store definition
import useAppStore from "./app.js";

// exporting for usage in the application
export const appStore = useAppStore();

// loading from browser information to the Pinia store
await getPiniaStoreInStorage(appStore.$patch, appStore.$id);

// now you can use subscribe to listen any changes and update the store automatically
// as below
await setPiniaStoreInStorage(
  appStore.$subscribe, 
  appStore.$id, 
  undefined, 
  [
    "header_options_opened",
    "menu_opened",
    "menu_filter",
  ]
);

```

## Methods Exported and Signatures

```javascript

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

// -----------------------------  SvelteStorage  --------------------------------------------------
// -----------------------------  setSvelteStoreInStorage  ----------------------------------------

async function setSvelteStoreInStorage(
  subscribe, // function to subscribe to the SVELTE store
  key, // key to be updated in the browser storage
  timeout, // time in milliseconds to expire the key - if not set will be forever
  ignoreKeys = [] // array of keys to ignore when updating the browser storage - this will be as the keys never existed
)

// -----------------------------  getSvelteStoreInStorage  ----------------------------------------

async function getSvelteStoreInStorage(update, key) // retrieves a key from the browser storage
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

// -----------------------------  PiniaStorage  ---------------------------------------------------
// -----------------------------  setPiniaStoreInStorage  -----------------------------------------

async function setPiniaStoreInStorage(
  $subscribe, // function to subscribe to the Pinia store
  key, // key to be updated in the browser storage
  timeout, // time in milliseconds to expire the key - if not set will be forever
  ignoreKeys = [] // array of keys to ignore when updating the browser storage - this will be as the keys never existed
) 

// -----------------------------  getPiniaStoreInStorage  -----------------------------------------

async function getPiniaStoreInStorage($patch, key) // retrieves a key from the browser storage
// $patch - function to update the Pinia store
// key - key to retrieve


```