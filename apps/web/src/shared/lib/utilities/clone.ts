import rfdc from 'rfdc'
import { isProxy, isReactive, isRef, toRaw, unref } from 'vue'

// Create rfdc instance for fast deep cloning
const clone = rfdc()

/**
 * Deep copy function for TypeScript with Vue 3 reactive proxy support.
 * Uses rfdc (really fast deep clone) with Vue's toRaw to unwrap proxies.
 * Automatically unwraps Vue proxies (reactive, readonly, ref) to create plain mutable copies.
 *
 * @param T Generic type of target/copied value.
 * @param source Target value to be copied.
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

  // Unwrap Vue reactive proxies (reactive, readonly, etc.) before cloning
  let rawSource = source
  if (isProxy(source) || isReactive(source)) {
    rawSource = toRaw(source) as T
  }

  // Use rfdc for fast deep cloning
  return clone(rawSource) as T
}

/**
 * JSON-based deep copy (slower but handles circular references via JSON.stringify/parse)
 * Use this only when you need to handle circular references.
 */
export function jsonCopy<T>(source: T): T {
  if (source == null) {
    return source
  }

  // Unwrap Vue refs
  if (isRef(source)) {
    return jsonCopy(unref(source)) as T
  }

  // Unwrap Vue reactive proxies
  let rawSource = source
  if (isProxy(source) || isReactive(source)) {
    rawSource = toRaw(source) as T
  }

  // Use JSON for cloning (handles circular refs but loses functions, dates, etc.)
  return JSON.parse(JSON.stringify(rawSource)) as T
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
