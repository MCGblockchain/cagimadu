export interface ApiMeta {
  source: 'ethereum-rpc'
  cached: boolean
  stale: boolean
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T
  meta: ApiMeta
}
