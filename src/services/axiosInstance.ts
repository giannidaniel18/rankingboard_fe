import axios, { type AxiosResponse, isAxiosError } from 'axios'
import useAuthStore from '@/store/useAuthStore'
import useToastStore from '@/store/useToastStore'
import type { ApiResponse } from '@/types'

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://apps/api'
    : 'http://localhost:5000/api'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor ─────────────────────────────────────────────────────
// Extend here to attach Authorization headers once auth tokens are available.
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
)

// ─── Response interceptor — ApiResponse<T> envelope unwrapper ────────────────
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const envelope = response.data as ApiResponse<unknown>

    // Only process structured envelopes; pass raw responses through unchanged.
    if (
      envelope !== null &&
      typeof envelope === 'object' &&
      'isSuccess' in envelope
    ) {
      if (envelope.isSuccess) {
        // Unwrap: callers receive T, not ApiResponse<T>
        response.data = envelope.data
        return response
      }

      const message = envelope.error ?? 'An unexpected error occurred.'
      useToastStore.getState().addToast(message, 'error')
      return Promise.reject(new Error(message))
    }

    return response
  },

  // ─── HTTP / network error handler ─────────────────────────────────────────
  (error) => {
    if (isAxiosError(error)) {
      const status = error.response?.status

      if (status === 401) {
        useAuthStore.getState().setCurrentUser(null)
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      if (!error.response || status === undefined || status >= 500) {
        const message = 'Backend unavailable. Please try again later.'
        useToastStore.getState().addToast(message, 'error')
        return Promise.reject(new Error(message))
      }
    }

    console.error('[axiosInstance] Unhandled error:', error)
    return Promise.reject(error)
  },
)

export default axiosInstance
