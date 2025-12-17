/**
 * FORGE AI Integration Types
 * Comprehensive TypeScript types for all AI operations
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// PRODUCTION MODE TYPES
// ═══════════════════════════════════════════════════════════

export type ProductionMode = 'mvp' | 'startup' | 'enterprise';

export const ProductionModeSchema = z.enum(['mvp', 'startup', 'enterprise']);

// ═══════════════════════════════════════════════════════════
// CODE GENERATION TYPES
// ═══════════════════════════════════════════════════════════

export interface GenerationParams {
  projectId: string;
  featureId: string;
  userId: string;

  // Feature details
  featureName: string;
  featureDescription: string;
  featureCategory: string;
  requirements: Record<string, any>;

  // Context
  productionMode: ProductionMode;
  projectMemories: ProjectMemory[];
  decisions: Decision[];
  existingFiles?: ExistingFile[];

  // Options
  streaming?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export const GenerationParamsSchema = z.object({
  projectId: z.string(),
  featureId: z.string(),
  userId: z.string(),
  featureName: z.string(),
  featureDescription: z.string(),
  featureCategory: z.string(),
  requirements: z.record(z.any()),
  productionMode: ProductionModeSchema,
  projectMemories: z.array(z.any()),
  decisions: z.array(z.any()),
  existingFiles: z.array(z.any()).optional(),
  streaming: z.boolean().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
});

// ═══════════════════════════════════════════════════════════
// CHAT TYPES
// ═══════════════════════════════════════════════════════════

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export interface ChatParams {
  messages: ChatMessage[];
  projectId?: string;
  userId: string;
  streaming?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export const ChatParamsSchema = z.object({
  messages: z.array(ChatMessageSchema),
  projectId: z.string().optional(),
  userId: z.string(),
  streaming: z.boolean().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
});

// ═══════════════════════════════════════════════════════════
// CODE EXPLANATION TYPES
// ═══════════════════════════════════════════════════════════

export interface ExplainParams {
  code: string;
  language: string;
  context?: string;
  userId: string;
}

export const ExplainParamsSchema = z.object({
  code: z.string(),
  language: z.string(),
  context: z.string().optional(),
  userId: z.string(),
});

// ═══════════════════════════════════════════════════════════
// REFACTORING TYPES
// ═══════════════════════════════════════════════════════════

export interface RefactorParams {
  code: string;
  instructions: string;
  language: string;
  userId: string;
  filePath?: string;
}

export const RefactorParamsSchema = z.object({
  code: z.string(),
  instructions: z.string(),
  language: z.string(),
  userId: z.string(),
  filePath: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// STREAMING RESPONSE TYPES
// ═══════════════════════════════════════════════════════════

export interface FileGeneration {
  path: string;
  content: string;
  language: string;
  purpose?: string;
  patterns?: string[];
}

export const FileGenerationSchema = z.object({
  path: z.string(),
  content: z.string(),
  language: z.string(),
  purpose: z.string().optional(),
  patterns: z.array(z.string()).optional(),
});

export interface StreamingChunk {
  type: 'file-start' | 'content-chunk' | 'file-complete' | 'explanation' | 'error' | 'done';
  data?: any;
}

export interface StreamingResponse {
  files: FileGeneration[];
  explanation?: string;
  tokensUsed: TokenUsage;
  estimatedCost: number;
}

// ═══════════════════════════════════════════════════════════
// CONTEXT BUILDING TYPES
// ═══════════════════════════════════════════════════════════

export interface ProjectMemory {
  id: string;
  category: string;
  key: string;
  title: string;
  content: any;
  reasoning?: string;
}

export interface Decision {
  id: string;
  category: string;
  title: string;
  description: string;
  recommendedOption: string;
  selectedOption?: string;
  alternatives: any;
  costImplications?: string;
  performanceImplications?: string;
  securityImplications?: string;
}

export interface ExistingFile {
  path: string;
  content: string;
  language: string;
  purpose?: string;
}

export interface GenerationContext {
  projectInfo: {
    name: string;
    description?: string;
    appType?: string;
    techStack?: any;
    architecture?: string;
  };
  productionMode: ProductionMode;
  memories: ProjectMemory[];
  decisions: Decision[];
  feature: {
    name: string;
    description: string;
    category: string;
    requirements: Record<string, any>;
  };
  existingFiles?: ExistingFile[];
  fileTree?: string;
}

// ═══════════════════════════════════════════════════════════
// TOKEN USAGE & COST TRACKING
// ═══════════════════════════════════════════════════════════

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface CostMetrics {
  tokensUsed: TokenUsage;
  estimatedCost: number;
  model: string;
  timestamp: Date;
}

export const TokenUsageSchema = z.object({
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
});

export const CostMetricsSchema = z.object({
  tokensUsed: TokenUsageSchema,
  estimatedCost: z.number(),
  model: z.string(),
  timestamp: z.date(),
});

// ═══════════════════════════════════════════════════════════
// MODEL CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const CLAUDE_MODELS = {
  SONNET_4_5: 'claude-sonnet-4-20250514',
  SONNET_3_5: 'claude-3-5-sonnet-20241022',
  HAIKU_3_5: 'claude-3-5-haiku-20241022',
} as const;

export type ClaudeModel = typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS];

// Pricing per 1M tokens (as of December 2024)
export const MODEL_PRICING = {
  [CLAUDE_MODELS.SONNET_4_5]: {
    input: 3.0,    // $3 per 1M input tokens
    output: 15.0,  // $15 per 1M output tokens
  },
  [CLAUDE_MODELS.SONNET_3_5]: {
    input: 3.0,
    output: 15.0,
  },
  [CLAUDE_MODELS.HAIKU_3_5]: {
    input: 0.8,
    output: 4.0,
  },
} as const;

// ═══════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class RateLimitError extends AIError {
  constructor(message: string, public retryAfter?: number) {
    super(message, 'RATE_LIMIT', 429, true);
    this.name = 'RateLimitError';
  }
}

export class ContextTooLargeError extends AIError {
  constructor(message: string, public tokenCount: number) {
    super(message, 'CONTEXT_TOO_LARGE', 400, false);
    this.name = 'ContextTooLargeError';
  }
}

export class AuthenticationError extends AIError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR', 401, false);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends AIError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', undefined, true);
    this.name = 'NetworkError';
  }
}

// ═══════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    statusCode?: number;
  };
}

// ═══════════════════════════════════════════════════════════
// DATABASE INTERACTION TYPES
// ═══════════════════════════════════════════════════════════

export interface AIInteractionData {
  userId: string;
  projectId?: string;
  type: string;
  prompt: string;
  response: string;
  tokensUsed: number;
  model: string;
  estimatedCost: number;
}

export const AIInteractionDataSchema = z.object({
  userId: z.string(),
  projectId: z.string().optional(),
  type: z.string(),
  prompt: z.string(),
  response: z.string(),
  tokensUsed: z.number(),
  model: z.string(),
  estimatedCost: z.number(),
});
