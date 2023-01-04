import { ClassType } from "class-transformer-validator";

type Cls<T extends ClassType<object>> = T extends ClassType<infer X> ? X : never;

// export function getFieldValues<F extends object, T extends string | { type: string }, FA extends F[] = F[]>(
//   value: T | T[] | undefined | null,
//   allowString: true,
//   allowed: {[EntityClass in keyof FA]: ClassType<FA[EntityClass]>},
// ): (string | Extract<T, F>)[];

/**
 * Values in ActivityStream objects can be a mixture of types, and may be provided
 * as a single value or an array of values.
 *
 * To normalize this, {@link getFieldValues} can accept an ActivityStream field value,
 * and will always return an array of values, optionally filtering the type of objects
 * and optionally filtering out strings.
 *
 * @param value A set of ActivityPub values
 * @param allowString if strings will be included, or filtered
 */
export function getFieldValues<T extends string | { type: string }>(
  value: T | T[] | undefined | null,
  allowString: true,
): T[];
export function getFieldValues<T extends string | { type: string }>(
  value: T | T[] | undefined | null,
  allowString: false,
): Exclude<T, string>[];
export function getFieldValues<T extends string | { type: string }, F extends ClassType<object>>(
  value: T | T[] | undefined | null,
  allowString: true,
  allowed: F[],
): (string | Extract<T, Cls<F>>)[];
export function getFieldValues<T extends string | { type: string }, F extends ClassType<object>>(
  value: T | T[] | undefined | null,
  allowString: false,
  allowed: F[],
): Extract<T, Cls<F>>[];
export function getFieldValues<T extends string | { type: string }, F extends ClassType<object>>(
  value: T | T[] | undefined | null,
  allowString: boolean,
  allowed?: F[],
): T[] | Exclude<T, string>[] | (string | Extract<T, Cls<F>>)[] | Extract<T, Cls<F>>[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter((v) => {
      if (typeof v === "string") {
        return allowString;
      }
      if (!allowed) {
        return true;
      }
      return !!allowed.find((a) => v instanceof a);
    });
  }
  if (typeof value === "string") {
    if (allowString) {
      return [value];
    } else {
      return [];
    }
  }
  if (!allowed || !!allowed.find((a) => value instanceof a)) {
    return [value];
  }
  return [];
}
