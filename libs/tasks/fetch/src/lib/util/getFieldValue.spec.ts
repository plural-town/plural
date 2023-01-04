import { Note, Person } from "@plural-town/activitystreams-validator";
import { transformAndValidateSync } from "class-transformer-validator";
import { getFieldValues } from "./getFieldValue";

const URL = "https://example.com/user/@test";

const person = transformAndValidateSync(Person, {
  type: "Person",
  id: URL,
});

const note = transformAndValidateSync(Note, {
  type: "Note",
  id: "https://example.com/user/@test/post/123",
});

describe("getFieldValues", () => {
  describe("getFieldValues(V, true)", () => {
    it("keeps a single string value", () => {
      const res = getFieldValues(URL, true);
      expect(res).toStrictEqual([URL]);
    });

    it("keeps arrays of string values", () => {
      const res = getFieldValues([URL, URL], true);
      expect(res).toStrictEqual([URL, URL]);
    });

    it("keeps entities (Person)", () => {
      const res = getFieldValues(person, true);
      expect(res).toStrictEqual([person]);
    });

    it("keeps arrays of entities (Person)", () => {
      const res = getFieldValues([person, person], true);
      expect(res).toStrictEqual([person, person]);
    });

    it("handles undefined", () => {
      expect(getFieldValues(undefined, true)).toStrictEqual([]);
    });

    it("handles null", () => {
      expect(getFieldValues(null, true)).toStrictEqual([]);
    });
  });

  describe("getFieldValues(V, false)", () => {
    it("keeps single entities (Person)", () => {
      expect(getFieldValues(person, false)).toStrictEqual([person]);
    });

    it("keeps arrays of entities (Person)", () => {
      const res = getFieldValues([person, person], false);
      expect(res).toStrictEqual([person, person]);
    });

    it("ignores single strings", () => {
      const res = getFieldValues(URL, false);
      expect(res).toStrictEqual([]);
    });

    it("ignores arrays of strings", () => {
      const res = getFieldValues([URL, URL], false);
      expect(res).toStrictEqual([]);
    });

    it("filters mixed arrays", () => {
      const res = getFieldValues([URL, person], false);
      expect(res).toStrictEqual([person]);
    });
  });

  describe("getFieldValues(V, true, [entities])", () => {
    it("keeps single strings with an empty filter", () => {
      const res = getFieldValues(URL, true, []);
      expect(res).toStrictEqual([URL]);
    });

    it("keeps single strings with a filter", () => {
      const res = getFieldValues(URL, true, [Person]);
      expect(res).toStrictEqual([URL]);
    });

    it("keeps string arrays with an empty filter", () => {
      const res = getFieldValues([URL, URL], true, []);
      expect(res).toStrictEqual([URL, URL]);
    });

    it("keeps string arrays with a filter", () => {
      const res = getFieldValues([URL, URL], true, [Person]);
      expect(res).toStrictEqual([URL, URL]);
    });

    it("keeps individual values matching the filter", () => {
      const res = getFieldValues(person, true, [Person]);
      expect(res).toStrictEqual([person]);
    });

    it("keeps single values matching a filter (with multiple element)", () => {
      const res = getFieldValues(person, true, [Person, Note]);
      expect(res).toStrictEqual([person]);
      const x: Person | string = res[0]; // check typescript typings
      expect(x).toBeInstanceOf(Person);
    });

    it("keeps multiple elements matching the filter (single type)", () => {
      const res = getFieldValues([person, person], true, [Person]);
      expect(res).toStrictEqual([person, person]);
      const x: Person | string = res[0]; // check typescript typings
      expect(x).toBeInstanceOf(Person);
    });

    it("keeps multiple elements matching a filter (with extra types)", () => {
      const res = getFieldValues([person, person], true, [Person, Note]);
      expect(res).toStrictEqual([person, person]);
      const x: Person | string = res[0]; // check typescript typings
      expect(x).toBeInstanceOf(Person);
    });

    it("keeps multiple types of elements that match the filter", () => {
      const res = getFieldValues([person, note], true, [Person, Note]);
      expect(res).toStrictEqual([person, note]);
      const x: Person | Note | string = res[0];
      expect(x).toBeInstanceOf(Person);
    });

    it("filters elements not matching the filter", () => {
      const res = getFieldValues([person, note], true, [Person]);
      expect(res).toStrictEqual([person]);
      const x: Person | string = res[0];
      expect(x).toBeInstanceOf(Person);
    });

    it("returns an empty array if a single value doesn't match the filter", () => {
      const res = getFieldValues(person, true, [Note]);
      expect(res).toStrictEqual([]);
    });
  });
});
