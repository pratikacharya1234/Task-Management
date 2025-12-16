import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// User Persona
export interface UserPersona {
  id: string
  name: string
  demographics: string
  technicalAbility: 'beginner' | 'intermediate' | 'advanced'
  painPoints: string[]
  useCases: string[]
}

// Onboarding flow state
export interface OnboardingData {
  // Step 1: What are you building?
  appType?: 'saas' | 'ecommerce' | 'marketplace' | 'healthcare' | 'fintech' | 'social' | 'custom'
  appDescription?: string

  // Step 2: Who are your users?
  targetUsers: UserPersona[]

  // Step 3: Timeline
  timeline?: '1-week' | '1-month' | '3-months'
  productionMode?: 'mvp' | 'startup' | 'enterprise'

  // Step 4: Special requirements
  requiresAuth?: boolean
  requiresPayments?: boolean
  requiresRealtime?: boolean
  complianceNeeds: string[] // HIPAA, GDPR, SOC2, etc.

  // Step 5: Technical preferences
  preferredAuthProvider?: string
  preferredDatabase?: string
  preferredDeployment?: string
}

interface OnboardingState {
  // Current step (0-indexed)
  currentStep: number
  totalSteps: number

  // Onboarding data
  data: OnboardingData

  // UI state
  isOpen: boolean
  isComplete: boolean

  // Actions
  setIsOpen: (open: boolean) => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: number) => void

  // Data updates
  updateData: (updates: Partial<OnboardingData>) => void
  addUserPersona: (persona: UserPersona) => void
  removeUserPersona: (id: string) => void
  updateUserPersona: (id: string, updates: Partial<UserPersona>) => void

  // Flow control
  completeOnboarding: () => void
  resetOnboarding: () => void
}

const initialData: OnboardingData = {
  targetUsers: [],
  complianceNeeds: [],
}

export const useOnboardingStore = create<OnboardingState>()(
  devtools((set, get) => ({
    currentStep: 0,
    totalSteps: 5,
    data: initialData,
    isOpen: false,
    isComplete: false,

    setIsOpen: (open) => set({ isOpen: open }),

    nextStep: () =>
      set((state) => ({
        currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
      })),

    previousStep: () =>
      set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 0),
      })),

    goToStep: (step) =>
      set({
        currentStep: Math.max(0, Math.min(step, get().totalSteps - 1)),
      }),

    updateData: (updates) =>
      set((state) => ({
        data: { ...state.data, ...updates },
      })),

    addUserPersona: (persona) =>
      set((state) => ({
        data: {
          ...state.data,
          targetUsers: [...state.data.targetUsers, persona],
        },
      })),

    removeUserPersona: (id) =>
      set((state) => ({
        data: {
          ...state.data,
          targetUsers: state.data.targetUsers.filter((p) => p.id !== id),
        },
      })),

    updateUserPersona: (id, updates) =>
      set((state) => ({
        data: {
          ...state.data,
          targetUsers: state.data.targetUsers.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        },
      })),

    completeOnboarding: () =>
      set({
        isComplete: true,
        isOpen: false,
      }),

    resetOnboarding: () =>
      set({
        currentStep: 0,
        data: initialData,
        isOpen: false,
        isComplete: false,
      }),
  }))
)
