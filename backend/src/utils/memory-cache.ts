export interface CacheResult<T> {
  data: T
  cached: boolean
  stale: boolean
  updatedAt: string
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
  updatedAt: string
}

export class MemoryCache {
  private readonly entries = new Map<string, CacheEntry<unknown>>()
  private readonly pending = new Map<string, Promise<CacheResult<unknown>>>()

  async remember<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<CacheResult<T>> {
    const current = this.entries.get(key) as CacheEntry<T> | undefined
    if (current && current.expiresAt > Date.now()) {
      return { data: current.data, cached: true, stale: false, updatedAt: current.updatedAt }
    }

    const running = this.pending.get(key) as Promise<CacheResult<T>> | undefined
    if (running) return running

    const request = (async () => {
      try {
        const data = await loader()
        const updatedAt = new Date().toISOString()
        this.entries.set(key, { data, expiresAt: Date.now() + ttlMs, updatedAt })
        return { data, cached: false, stale: false, updatedAt }
      } catch (error) {
        if (current) {
          return { data: current.data, cached: true, stale: true, updatedAt: current.updatedAt }
        }
        throw error
      } finally {
        this.pending.delete(key)
      }
    })()

    this.pending.set(key, request as Promise<CacheResult<unknown>>)
    return request
  }

  clear() {
    this.entries.clear()
    this.pending.clear()
  }
}
