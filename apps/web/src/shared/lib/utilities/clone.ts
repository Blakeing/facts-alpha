import { isProxy, isReactive, isRef, toRaw, unref } from 'vue'

/**
 * Deep copy function for TypeScript with Vue 3 reactive proxy support.
 * Automatically unwraps Vue proxies (reactive, readonly, ref) to create plain mutable copies.
 *
 * @param T Generic type of target/copied value.
 * @param source Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export function deepCopy<T>(source: T): T {
  // Handle null and undefined
  if (source == null) {
    return source
  }

  // Unwrap Vue refs
  if (isRef(source)) {
    return deepCopy(unref(source)) as T
  }

  // Unwrap Vue reactive proxies (reactive, readonly, etc.)
  if (isProxy(source) || isReactive(source)) {
    source = toRaw(source)
  }

  // Handle Date objects
  if (source instanceof Date) {
    return new Date(source) as T
  }

  // Handle RegExp
  if (source instanceof RegExp) {
    return new RegExp(source.source, source.flags) as T
  }

  // Handle Arrays
  if (Array.isArray(source)) {
    return source.map((item) => deepCopy(item)) as T
  }

  // Handle plain objects
  if (typeof source === 'object') {
    const copy = {} as Record<string, unknown>
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        copy[key] = deepCopy(source[key])
      }
    }
    return copy as T
  }

  // Handle primitives (string, number, boolean, symbol, bigint)
  return source
}

/**
 * Deep copy to a new type with Vue 3 reactive proxy support.
 * @throws Error if source is null
 */
export function deepCopyToNewType<TDest>(source: unknown): TDest {
  if (source == null) {
    throw new Error('source cannot be null or undefined')
  }
  return deepCopy(source) as TDest
}
