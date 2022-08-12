import { describe, it } from "vitest";
import * as commonFunctions from "../functions/commonFunctions";

describe("commonFunctions", () => {
  // toJSON()
  describe("toJSON()", () => {
    it("when pass undefined toJSON() to throw error message as defined", () => {
      expect(commonFunctions.toJSON()).toBeUndefined();
    });

    // --------------------------------------------------------------------------------------------

    it("when pass an object toJSON() to return a json string", () => {
      const result = commonFunctions.toJSON({ test: "ok" });
      expect(result).toBe('{"test":"ok"}');
    });
  });

  // ----------------------------------------------------------------------------------------------

  // fromJSON()
  describe("fromJSON()", () => {
    it("when pass undefined fromJSON() to return the item unmodified and undefined", () => {
      expect(commonFunctions.fromJSON()).toBeUndefined();
    });

    // --------------------------------------------------------------------------------------------

    it("when pass an JSON String of Object fromJSON() to return an object item", () => {
      let item = { test: "ok" };
      const testItem = JSON.stringify(item);

      expect(commonFunctions.fromJSON(testItem)).toEqual(item);
    });

    // --------------------------------------------------------------------------------------------

    it("when pass an JSON String of Array fromJSON() to return an array item", () => {
      let item = ["test", "ok"];
      const testItem = JSON.stringify(item);

      expect(commonFunctions.fromJSON(testItem)).toEqual(item);
    });

    // --------------------------------------------------------------------------------------------

    it("when pass an wrong JSON String return the string passed", () => {
      const resultFn = commonFunctions.fromJSON("aeahow");
      expect(resultFn).toBe("aeahow");
    });
  });

  // ----------------------------------------------------------------------------------------------

  // toJSON -> fromJSON()
  describe("toJSON -> fromJSON()", () => {
    it("to transform an object to json and retrieve the same object", () => {
      const item = { test: "ok" };
      const testItem = commonFunctions.toJSON(item);
      const result = commonFunctions.fromJSON(testItem);
      expect(result).toEqual(item);
    });

    // --------------------------------------------------------------------------------------------

    it("to transform an array to json and retrieve the same object", () => {
      const item = ["test", "ok"];
      const testItem = commonFunctions.toJSON(item);
      const result = commonFunctions.fromJSON(testItem);
      expect(result).toEqual(item);
    });
  });

  // ----------------------------------------------------------------------------------------------

  // toCypher()
  describe("toCypher()", () => {
    it("when pass a key undefined toCypher() to return the raw value informed", () => {
      const result = commonFunctions.toCypher(undefined, "ok");
      expect(result).toBe("ok");
    });

    // --------------------------------------------------------------------------------------------

    it("when pass a value undefined toCypher() to return a cypher undefined", () => {
      const result = commonFunctions.toCypher("ok", undefined);
      expect(result).toBeUndefined();
    });

    // --------------------------------------------------------------------------------------------

    it("when pass a key and value toCypher() to return a cypher value", () => {
      const result = commonFunctions.toCypher("ok", "test");
      expect(result.length).toBeGreaterThan(40);
    });
  });

  // ----------------------------------------------------------------------------------------------

  // fromCypher()
  describe("fromCypher()", () => {
    it("when pass a key undefined fromCypher() to return the raw value informed", () => {
      const result = commonFunctions.fromCypher(undefined, "ok");
      expect(result).toBe("ok");
    });

    // --------------------------------------------------------------------------------------------

    it("when pass a value undefined fromCypher() to return a cypher undefined", () => {
      const result = commonFunctions.fromCypher("ok", undefined);
      expect(result).toBeUndefined();
    });

    // --------------------------------------------------------------------------------------------

    it("when pass a key and value fromCypher() to return a cypher value", () => {
      const result = commonFunctions.fromCypher(
        "ok",
        "U2FsdGVkX18PUNQsi2NOxqwxZdW0o8vl2f2iW5jhuig="
      );
      expect(result).toBe("test");
    });

    // --------------------------------------------------------------------------------------------

    it("when pass a key and wrong value fromCypher() to return false", () => {
      const result = commonFunctions.fromCypher("ok", "notacypheredvalue");
      expect(result).toBe(false);
    });
  });

  // ----------------------------------------------------------------------------------------------

  // toCypher -> fromCypher()
  describe("toCypher() -> fromCypher()", () => {
    it("to Cypher a key value an then retrieve the same value", () => {
      const item = "test";
      const testItem = commonFunctions.toCypher("ok", item);
      const result = commonFunctions.fromCypher("ok", testItem);
      expect(result).toEqual(item);
    });
  });
});
