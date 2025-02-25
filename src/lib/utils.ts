export function assert(condition: unknown, errorMessage: string | (() => string)): asserts condition {
  if (!condition) {
    throw new Error(typeof errorMessage === 'function' ? errorMessage() : errorMessage);
  }
}

// NOTE This is for ensuring *invariance*(-ish) on the type of the map of `insertInto`.
// This way, the type of `map` (`T`) is inferred first, then the other two arguments will be checked against it, rather than the types of
// `key` and `value` dictating what the map should be like (because TypeScript sees `map` as *covariant* by default, which is not suitable
// for mutable operations like insertion).
export type KeyOfMap<T> = T extends Map<infer K, unknown> ? K : never;
export type ValueOfMap<T> = T extends Map<unknown, infer V> ? V : never;
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

export function insertInto<K, V, T extends Map<K, V[]> = Map<K, V[]>>(map: T, key: KeyOfMap<T>, value: ArrayElement<ValueOfMap<T>>) {
  if (!map.has(key)) {
    map.set(key, [value]);
  } else {
    map.get(key)!.push(value);
  }
}

export function insertValuesInto<K, V, T extends Map<K, V[]> = Map<K, V[]>>(map: T, key: KeyOfMap<T>, values: ValueOfMap<T>) {
  if (!map.has(key)) {
    map.set(key, [...values]);
  } else {
    map.get(key)!.push(...values);
  }
}

export function prependValuesInto<K, V, T extends Map<K, V[]> = Map<K, V[]>>(map: T, key: KeyOfMap<T>, values: ValueOfMap<T>) {
  if (!map.has(key)) {
    map.set(key, [...values]);
  } else {
    map.get(key)!.unshift(...values);
  }
}
