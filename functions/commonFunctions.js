import CryptoJS from "crypto-js";

// -----------------------------  toJSON  ----------------------------------------------------------

export function toJSON(item) {
  try {
    if (typeof item == "object" || Array.isArray(item)) {
      return JSON.stringify(item);
    }
    return item;
  } catch (error) {
    throw error;
  }
}

// -----------------------------  fromJSON  -------------------------------------------------------

export function fromJSON(item) {
  if (!item || typeof item !== "string" || item.length === 0) {
    return;
  }
  try {
    return JSON.parse(item);
  } catch (error) {
    return item;
  }
}

// -----------------------------  toCypher  -------------------------------------------------------

export function toCypher(key, value) {
  try {
    if (!key || !value) {
      return value;
    }

    return CryptoJS.AES.encrypt(value, key).toString();
  } catch (error) {
    throw error;
  }
}

// -----------------------------  fromCypher  -----------------------------------------------------

export function fromCypher(key, value) {
  try {
    if (!key || !value) {
      return value;
    }

    const bytes = CryptoJS.AES.decrypt(value, key);
    const result = bytes.toString(CryptoJS.enc.Utf8).trim();
    if (!result || result.length == 0) {
      return false;
    }
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}
