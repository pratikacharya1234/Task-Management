import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface CodeFile {
  id: string
  path: string
  content: string
  language: string
  purpose?: string
  isDirty: boolean
  isNew: boolean
}

export interface EditorTab {
  fileId: string
  filePath: string
  isPinned: boolean
}

interface EditorState {
  // Files
  files: CodeFile[]
  activeFileId: string | null

  // Tabs
  openTabs: EditorTab[]

  // UI state
  sidebarOpen: boolean
  terminalOpen: boolean
  aiAssistantOpen: boolean

  // Editor preferences
  fontSize: number
  theme: 'dark' | 'light'
  wordWrap: boolean

  // Actions - File management
  addFile: (file: CodeFile) => void
  updateFile: (id: string, updates: Partial<CodeFile>) => void
  deleteFile: (id: string) => void
  setActiveFile: (id: string | null) => void

  // Actions - Tab management
  openTab: (file: CodeFile) => void
  closeTab: (fileId: string) => void
  pinTab: (fileId: string) => void
  unpinTab: (fileId: string) => void

  // Actions - UI
  toggleSidebar: () => void
  toggleTerminal: () => void
  toggleAIAssistant: () => void
  setFontSize: (size: number) => void
  setTheme: (theme: 'dark' | 'light') => void
  toggleWordWrap: () => void
}

export const useEditorStore = create<EditorState>()(
  devtools((set, get) => ({
    files: [],
    activeFileId: null,
    openTabs: [],
    sidebarOpen: true,
    terminalOpen: false,
    aiAssistantOpen: false,
    fontSize: 14,
    theme: 'dark',
    wordWrap: true,

    // File management
    addFile: (file) =>
      set((state) => ({
        files: [...state.files, file],
      })),

    updateFile: (id, updates) =>
      set((state) => ({
        files: state.files.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ),
      })),

    deleteFile: (id) =>
      set((state) => ({
        files: state.files.filter((f) => f.id !== id),
        openTabs: state.openTabs.filter((t) => t.fileId !== id),
        activeFileId: state.activeFileId === id ? null : state.activeFileId,
      })),

    setActiveFile: (id) => set({ activeFileId: id }),

    // Tab management
    openTab: (file) =>
      set((state) => {
        // Check if tab already exists
        const existingTab = state.openTabs.find((t) => t.fileId === file.id)
        if (existingTab) {
          return { activeFileId: file.id }
        }

        return {
          openTabs: [
            ...state.openTabs,
            { fileId: file.id, filePath: file.path, isPinned: false },
          ],
          activeFileId: file.id,
        }
      }),

    closeTab: (fileId) =>
      set((state) => {
        const newTabs = state.openTabs.filter((t) => t.fileId !== fileId)
        const wasActive = state.activeFileId === fileId

        return {
          openTabs: newTabs,
          activeFileId: wasActive
            ? newTabs.length > 0
              ? newTabs[newTabs.length - 1].fileId
              : null
            : state.activeFileId,
        }
      }),

    pinTab: (fileId) =>
      set((state) => ({
        openTabs: state.openTabs.map((t) =>
          t.fileId === fileId ? { ...t, isPinned: true } : t
        ),
      })),

    unpinTab: (fileId) =>
      set((state) => ({
        openTabs: state.openTabs.map((t) =>
          t.fileId === fileId ? { ...t, isPinned: false } : t
        ),
      })),

    // UI controls
    toggleSidebar: () =>
      set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    toggleTerminal: () =>
      set((state) => ({ terminalOpen: !state.terminalOpen })),

    toggleAIAssistant: () =>
      set((state) => ({ aiAssistantOpen: !state.aiAssistantOpen })),

    setFontSize: (size) => set({ fontSize: size }),

    setTheme: (theme) => set({ theme }),

    toggleWordWrap: () =>
      set((state) => ({ wordWrap: !state.wordWrap })),
  }))
)
