import { isFieldLanguage } from "./isFieldLanguage";

describe("isFieldLanguage", () => {
  describe("accepts language codes", () => {
    it.each(["EN"])("%p", (lang) => {
      expect(isFieldLanguage(lang)).toBe(true);
    });
  });

  describe("rejects other text", () => {
    it.each(["english", "en-US", "en"])("%p", (lang) => {
      expect(isFieldLanguage(lang)).toBe(false);
    });
  });
});
