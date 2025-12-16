import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export interface Modal {
  id: string
  component: string
  props?: any
}

interface UIState {
  // Toasts
  toasts: Toast[]

  // Modals
  modals: Modal[]

  // Loading states
  globalLoading: boolean
  loadingMessage?: string

  // Command palette
  commandPaletteOpen: boolean

  // Actions - Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void

  // Actions - Modals
  openModal: (modal: Omit<Modal, 'id'>) => void
  closeModal: (id: string) => void
  closeAllModals: () => void

  // Actions - Loading
  setGlobalLoading: (loading: boolean, message?: string) => void

  // Actions - Command palette
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    toasts: [],
    modals: [],
    globalLoading: false,
    commandPaletteOpen: false,

    // Toast management
    addToast: (toast) =>
      set((state) => ({
        toasts: [
          ...state.toasts,
          {
            ...toast,
            id: Math.random().toString(36).substring(7),
          },
        ],
      })),

    removeToast: (id) =>
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),

    // Modal management
    openModal: (modal) =>
      set((state) => ({
        modals: [
          ...state.modals,
          {
            ...modal,
            id: Math.random().toString(36).substring(7),
          },
        ],
      })),

    closeModal: (id) =>
      set((state) => ({
        modals: state.modals.filter((m) => m.id !== id),
      })),

    closeAllModals: () => set({ modals: [] }),

    // Loading state
    setGlobalLoading: (loading, message) =>
      set({
        globalLoading: loading,
        loadingMessage: message,
      }),

    // Command palette
    toggleCommandPalette: () =>
      set((state) => ({
        commandPaletteOpen: !state.commandPaletteOpen,
      })),

    setCommandPaletteOpen: (open) =>
      set({ commandPaletteOpen: open }),
  }))
)
