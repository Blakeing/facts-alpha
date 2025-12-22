/**
 * Object and data manipulation utilities
 *
 * Re-exports useful lodash functions for common operations.
 * Using lodash-es for tree-shaking support.
 */

// Deep comparison - handles Date, undefined, circular refs better than JSON.stringify
export { isEqual } from 'lodash-es'

// Deep cloning - more reliable than structuredClone for complex objects
export { cloneDeep } from 'lodash-es'

// Deep object merging
export { merge } from 'lodash-es'

// Array/object utilities
export { groupBy } from 'lodash-es'
export { keyBy } from 'lodash-es'
export { pick } from 'lodash-es'
export { omit } from 'lodash-es'
export { uniqBy } from 'lodash-es'
export { sortBy } from 'lodash-es'
export { orderBy } from 'lodash-es'

// Function utilities
export { debounce } from 'lodash-es'
export { throttle } from 'lodash-es'

// Number utilities
export { round } from 'lodash-es'
export { clamp } from 'lodash-es'

// String utilities
export { kebabCase } from 'lodash-es'
export { camelCase } from 'lodash-es'
export { capitalize } from 'lodash-es'
