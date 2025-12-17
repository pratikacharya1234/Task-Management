/**
 * Core types for FORGE
 */

export type ProductionMode = 'mvp' | 'startup' | 'enterprise'

export interface Project {
  id: string
  name: string
  description?: string
  mode: ProductionMode
  createdAt: Date
  updatedAt: Date
}

export interface Decision {
  id: string
  projectId: string
  category: string
  question: string
  selectedOption: string
  createdAt: Date
}

export interface Change {
  id: string
  projectId: string
  type: 'file' | 'decision' | 'generation'
  description: string
  createdAt: Date
}

export interface AIInteraction {
  id: string
  projectId: string
  type: 'generation' | 'chat' | 'analysis'
  inputTokens: number
  outputTokens: number
  cost: number
  createdAt: Date
}
