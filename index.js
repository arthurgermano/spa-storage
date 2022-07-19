const defaultOptions = {
  encrypted: false,
  IDX_DB_NAME: `OS_DB_`,
  IDX_DB_STORE: `OS_IDX_STORE_`,
  EXPIRE_KEYS: `OS_EXPIRE_KEYS`,
  VERSION: 1,
  DESCRIPTION: `OS_DB_DESCRIPTOR_1`,
  CHECK_EXPIRED_KEYS_INTERVAL: 5000,
};

import FORAGE from "./forage.js";
import STORAGE from "./storage.js";

export default (type = "forage", options = {}) => {
  if (type === "forage") {
    return FORAGE({ ...defaultOptions, ...options });
  }
  if (type === "storage") {
    return STORAGE({ ...defaultOptions, ...options });
  }
  throw new Error("The only valid types are 'forage' and 'storage'");
};
