import type { ParsedUrlQuery } from "querystring";

export function param(query: ParsedUrlQuery, key: string, defaultValue: string) {
  const val = query[key];
  if (val && typeof val === "string") {
    return val;
  }
  return defaultValue;
}

export function intParam(query: ParsedUrlQuery, key: string, defaultValue: number) {
  const val = query[key];
  if (val && typeof val === "string") {
    const parsed = parseInt(val, 10);
    if (parsed && !isNaN(parsed)) {
      return parsed;
    }
  }
  return defaultValue;
}
