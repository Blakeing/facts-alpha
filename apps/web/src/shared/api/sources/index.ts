import type { ApiType } from '../http/config'

export function getApiType(): ApiType {
  return (import.meta.env.VITE_API_TYPE || 'json-server') as ApiType
}

export { createHttpDataSource } from './createHttpDataSource'


