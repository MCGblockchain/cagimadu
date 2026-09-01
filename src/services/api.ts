import type { ApiResponse, BlockData, CurrentFeeData, FeeHistoryData } from '../types'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

const request = async <T>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>> => {
  const timeoutController = new AbortController()
  const timeout = window.setTimeout(() => timeoutController.abort(), 10_000)
  const abort = () => timeoutController.abort()
  signal?.addEventListener('abort', abort, { once: true })

  try {
    const response = await fetch(`${API_URL}${path}`, {
      signal: timeoutController.signal,
      headers: { Accept: 'application/json' },
    })
    const payload = await response.json().catch(() => null) as ApiResponse<T> | { error?: { message?: string } } | null
    if (!response.ok) {
      const message = payload && 'error' in payload ? payload.error?.message : undefined
      throw new ApiError(message ?? 'A API não conseguiu processar a solicitação.', response.status)
    }
    return payload as ApiResponse<T>
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (timeoutController.signal.aborted && !signal?.aborted) throw new ApiError('A API demorou demais para responder.')
    throw new ApiError('Não foi possível conectar à API do Cagimadu.')
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

export const api = {
  blocks: (limit = 40, signal?: AbortSignal) => request<BlockData[]>(`/blocks?limit=${limit}`, signal),
  block: (number: number, signal?: AbortSignal) => request<BlockData>(`/blocks/${number}`, signal),
  currentFee: (signal?: AbortSignal) => request<CurrentFeeData>('/fees/current', signal),
  feeHistory: (blocks: number, signal?: AbortSignal) => request<FeeHistoryData>(`/fees/history?blocks=${blocks}`, signal),
}
