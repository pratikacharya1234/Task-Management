/**
 * FORGE AI Integration Layer
 * Export all AI-related functionality
 */

// Main client
export { ClaudeClient, getClaudeClient } from './claude-client';

// Cost tracking
export { CostTracker, createCostTrackingMiddleware } from './cost-tracker';

// Streaming
export { StreamingResponseHandler, createStreamingHandler } from './streaming';

// Context building
export {
  buildGenerationContext,
  formatContextAsMarkdown,
  generateFileTree,
  compressContext,
  estimateTokenCount,
  isWithinTokenLimit,
  buildMinimalContext,
  filterRelevantMemories,
  filterRelevantDecisions,
  optimizeContext,
} from './context-builder';

// System Prompts
export {
  getSystemPrompt,
  BASE_ROLE,
  MVP_MODE_PROMPT,
  STARTUP_MODE_PROMPT,
  ENTERPRISE_MODE_PROMPT,
  CODE_EXPLANATION_PROMPT,
  CODE_REFACTORING_PROMPT,
  CHAT_ASSISTANT_PROMPT,
} from './prompts/system-prompts';

// Feature Prompts
export {
  getFeaturePrompt,
  AUTH_FEATURE_PROMPT,
  CRUD_FEATURE_PROMPT,
  DASHBOARD_FEATURE_PROMPT,
  PAYMENT_FEATURE_PROMPT,
  API_FEATURE_PROMPT,
  FILE_UPLOAD_FEATURE_PROMPT,
  SEARCH_FEATURE_PROMPT,
  NOTIFICATION_FEATURE_PROMPT,
  CUSTOM_FEATURE_PROMPT,
} from './prompts/feature-prompts';

// Types
export type {
  ProductionMode,
  GenerationParams,
  ChatParams,
  ChatMessage,
  ExplainParams,
  RefactorParams,
  FileGeneration,
  StreamingChunk,
  StreamingResponse,
  ProjectMemory,
  Decision,
  ExistingFile,
  GenerationContext,
  TokenUsage,
  CostMetrics,
  ClaudeModel,
  APIResponse,
  AIInteractionData,
} from './types';

export {
  CLAUDE_MODELS,
  MODEL_PRICING,
  AIError,
  RateLimitError,
  ContextTooLargeError,
  AuthenticationError,
  NetworkError,
  ProductionModeSchema,
  GenerationParamsSchema,
  ChatParamsSchema,
  ChatMessageSchema,
  ExplainParamsSchema,
  RefactorParamsSchema,
  FileGenerationSchema,
  TokenUsageSchema,
  CostMetricsSchema,
  AIInteractionDataSchema,
} from './types';
