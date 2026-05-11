import { create } from 'zustand'

export type ToastType = 'error' | 'success' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  exiting: boolean
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: string) => void
}

const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (message, type) => {
    const id = crypto.randomUUID()
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, exiting: false }],
    }))
    // Trigger exit animation, then remove after it completes
    setTimeout(() => get().removeToast(id), 3000)
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 280)
  },
}))

export default useToastStore
