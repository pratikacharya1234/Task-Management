import { Project, Decision } from '@/lib/stores/projectStore'

export interface GeneratedFile {
  path: string // 'src/components/Button.tsx'
  content: string
  language: string // 'typescript', 'css', 'json'
  explanation?: string // AI explanation of this file
  type: 'component' | 'api' | 'type' | 'test' | 'config' | 'doc'
}

export interface GenerationContext {
  project: Project
  memory: ProjectMemory[]
  decisions: Decision[]
  feature: Feature
  mode: ProductionMode
}

export interface ProgressUpdate {
  stage: 'validating' | 'preparing' | 'generating' | 'testing' | 'documenting' | 'saving' | 'complete'
  progress: number // 0-100
  message: string
  currentFile?: string
}

export interface FileTree {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: FileTree[]
  size?: number
  language?: string
}

export enum FeatureType {
  AUTH = 'AUTH',
  CRUD = 'CRUD',
  DASHBOARD = 'DASHBOARD',
  PAYMENT = 'PAYMENT',
  API = 'API',
  UPLOAD = 'UPLOAD',
  SEARCH = 'SEARCH',
  NOTIFICATIONS = 'NOTIFICATIONS',
  CUSTOM = 'CUSTOM'
}

export interface Feature {
  name: string
  type: FeatureType
  description: string
  requirements?: string[]
}

export interface GenerateFeatureParams {
  project: Project
  feature: Feature
  mode?: ProductionMode
  onProgress?: (update: ProgressUpdate) => void
}

export interface GenerationResult {
  success: boolean
  files: GeneratedFile[]
  change: Change
  warnings: ValidationWarning[]
  metrics: {
    filesGenerated: number
    linesOfCode: number
    tokensUsed: number
    costUSD: number
    timeSeconds: number
  }
  error?: string
}

export interface ValidationWarning {
  severity: 'error' | 'warning' | 'info'
  message: string
  file?: string
  line?: number
  column?: number
  code?: string
  fix?: string
}

export interface ValidationResult {
  passed: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  suggestions: ValidationIssue[]
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  message: string
  file?: string
  line?: number
  column?: number
  code?: string // Code snippet
  fix?: string // Suggested fix
}

export type ProductionMode = 'mvp' | 'startup' | 'enterprise'

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

export interface Change {
  id: string
  projectId: string
  description: string
  reasoning: string
  filesAffected: string[]
  createdAt: Date
  createdBy: 'ai' | 'user'
}
