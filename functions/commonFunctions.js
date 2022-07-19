

// -----------------------------  toJSON  ----------------------------------------------------------

export function toJSON(item) {
  if (typeof item === "object") {
    return JSON.stringify(item);
  }
  return item;
}

// -----------------------------  fromJSON  -------------------------------------------------------

export function fromJSON(item) {
  if (!item) {
    return item;
  }
  try {
    return JSON.parse(item);
  } catch (err) {
    return item;
  }
}

