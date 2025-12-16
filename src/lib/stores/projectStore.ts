import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types
export interface ProjectMemory {
  id: string
  category: string
  key: string
  title: string
  content: any
  reasoning?: string
  version: number
  updatedAt: Date
}

export interface Decision {
  id: string
  category: string
  title: string
  description: string
  recommendedOption: string
  selectedOption?: string
  alternatives: Array<{
    name: string
    pros: string[]
    cons: string[]
    cost?: string
    performance?: string
    security?: string
  }>
  status: 'pending' | 'approved' | 'rejected'
}

export interface Feature {
  id: string
  name: string
  description?: string
  category: string
  status: 'planning' | 'building' | 'testing' | 'complete'
  priority: number
  completenessScore: number
  testCoverage: number
}

export interface Project {
  id: string
  name: string
  description?: string
  slug: string
  appType?: string
  targetUsers?: any[]
  techStack?: any
  architecture?: string
  productionMode: 'mvp' | 'startup' | 'enterprise'
  status: 'forging' | 'ready' | 'deployed'
  progress: number
  memories: ProjectMemory[]
  decisions: Decision[]
  features: Feature[]
  createdAt: Date
  updatedAt: Date
}

interface ProjectState {
  // Current project
  currentProject: Project | null
  projects: Project[]

  // Loading states
  isLoading: boolean
  isCreating: boolean

  // Actions
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Memory management
  addMemory: (memory: ProjectMemory) => void
  updateMemory: (id: string, updates: Partial<ProjectMemory>) => void
  deleteMemory: (id: string) => void

  // Decision management
  addDecision: (decision: Decision) => void
  updateDecision: (id: string, updates: Partial<Decision>) => void
  approveDecision: (id: string, selectedOption: string) => void
  rejectDecision: (id: string) => void

  // Feature management
  addFeature: (feature: Feature) => void
  updateFeature: (id: string, updates: Partial<Feature>) => void
  deleteFeature: (id: string) => void

  // Loading state
  setLoading: (loading: boolean) => void
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        currentProject: null,
        projects: [],
        isLoading: false,
        isCreating: false,

        setCurrentProject: (project) => set({ currentProject: project }),

        setProjects: (projects) => set({ projects }),

        addProject: (project) =>
          set((state) => ({
            projects: [...state.projects, project],
          })),

        updateProject: (id, updates) =>
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
            ),
            currentProject:
              state.currentProject?.id === id
                ? { ...state.currentProject, ...updates, updatedAt: new Date() }
                : state.currentProject,
          })),

        deleteProject: (id) =>
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
          })),

        // Memory management
        addMemory: (memory) =>
          set((state) => {
            if (!state.currentProject) return state
            return {
              currentProject: {
                ...state.currentProject,
                memories: [...state.currentProject.memories, memory],
              },
            }
          }),

        updateMemory: (id, updates) =>
          set((state) => {
            if (!state.currentProject) return state
            return {
              currentProject: {
                ...state.currentProject,
                memories: state.currentProject.memories.map((m) =>
                  m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
                ),
              },
            }
          }),

        deleteMemory: (id) =>
          set((state) => {
            if (!state.currentProject) return state
            return {
              currentProject: {
                ...state.currentProject,
                memories: state.currentProject.memories.filter((m) => m.id !== id),
              },
            }
          }),

        // Decision management
        addDecision: (decision) =>
          set((state) => {
            if (!state.currentProject) return state
            return {
              currentProject: {
                ...state.currentProject,
                decisions: [...state.currentProject.decisions, decision],
              },
            }
          }),

        updateDecision: (id, updates) =>
          set((state) => {
            if (!state.currentProject) return state
            return {
              currentProject: {
                ...state.currentProject,
                decisions: state.currentProject.decisions.map((d) =>
                  d.id === id ? { ...d, ...updates } : d
                ),
              },
            }
          }),

        approveDecision: (id, selectedOption) =>
          set((state) => {
            if (!state.currentProject) return state
            return {
              currentProject: {
                ...state.currentProject,
                decisions: state.currentProject.decisions.map((d) =>
                  d.id === id
                    ? { ...d, status: 'approved' as const, selectedOption }
                    : d
                ),
              },
            }
          }),

        rejectDecision: (id) =>
          set((state) => {
            if (!state.currentProject) return state
            return {
              currentProject: {
                ...state.currentProject,
                decisions: state.currentProject.decisions.map((d) =>
                  d.id === id ? { ...d, status: 'rejected' as const } : d
                ),
              },
            }
          }),

        // Feature management
        addFeature: (feature) =>
          set((state) => {
            if (!state.currentProject) return state
            return {
              currentProject: {
                ...state.currentProject,
                features: [...state.currentProject.features, feature],
              },
            }
          }),

        updateFeature: (id, updates) =>
          set((state) => {
            if (!state.currentProject) return state
            return {
              currentProject: {
                ...state.currentProject,
                features: state.currentProject.features.map((f) =>
                  f.id === id ? { ...f, ...updates } : f
                ),
              },
            }
          }),

        deleteFeature: (id) =>
          set((state) => {
            if (!state.currentProject) return state
            return {
              currentProject: {
                ...state.currentProject,
                features: state.currentProject.features.filter((f) => f.id !== id),
              },
            }
          }),

        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'forge-project-storage',
        partialize: (state) => ({
          currentProject: state.currentProject,
          projects: state.projects,
        }),
      }
    )
  )
)
