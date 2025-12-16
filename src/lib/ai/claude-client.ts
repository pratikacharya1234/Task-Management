/**
 * FORGE Claude Client
 * Production-ready Claude API integration with:
 * - Streaming responses
 * - Retry logic with exponential backoff
 * - Token counting and cost tracking
 * - Error handling with custom error types
 * - Usage quota management
 */

import Anthropic from '@anthropic-ai/sdk';
import type { MessageStreamEvent } from '@anthropic-ai/sdk/resources/messages';
import {
  GenerationParams,
  ChatParams,
  ExplainParams,
  RefactorParams,
  ChatMessage,
  TokenUsage,
  StreamingResponse,
  CLAUDE_MODELS,
  ClaudeModel,
  AIError,
  RateLimitError,
  ContextTooLargeError,
  AuthenticationError,
  NetworkError,
} from './types';
import { CostTracker } from './cost-tracker';
import { StreamingResponseHandler, createStreamingHandler } from './streaming';
import { formatContextAsMarkdown, estimateTokenCount, compressContext } from './context-builder';
import { getSystemPrompt } from './prompts/system-prompts';
import { getFeaturePrompt } from './prompts/feature-prompts';

export class ClaudeClient {
  private client: Anthropic;
  private model: ClaudeModel;
  private maxRetries: number;

  constructor(apiKey?: string, model: ClaudeModel = CLAUDE_MODELS.SONNET_4_5, maxRetries: number = 3) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.model = model;
    this.maxRetries = maxRetries;
  }

  /**
   * Main code generation method with streaming support
   */
  async generateCode(
    params: GenerationParams,
  ): Promise<StreamingResponse | AsyncGenerator<string, StreamingResponse>> {
    // Check user quota first
    const hasQuota = await CostTracker.hasRemainingQuota(params.userId);
    if (!hasQuota) {
      throw new AIError(
        'AI interaction quota exceeded. Please upgrade your plan.',
        'QUOTA_EXCEEDED',
        429,
        false,
      );
    }

    // Build system prompt
    const systemPrompt = getSystemPrompt(params.productionMode);

    // Build user prompt
    const contextMarkdown = formatContextAsMarkdown({
      projectInfo: {
        name: 'Project',
        techStack: params.projectMemories.find((m) => m.category === 'tech_stack')?.content,
      },
      productionMode: params.productionMode,
      memories: params.projectMemories,
      decisions: params.decisions,
      feature: {
        name: params.featureName,
        description: params.featureDescription,
        category: params.featureCategory,
        requirements: params.requirements,
      },
      existingFiles: params.existingFiles,
    });

    // Add feature-specific prompt if available
    const featurePrompt = getFeaturePrompt(params.featureCategory);
    let userPrompt = contextMarkdown;

    if (featurePrompt) {
      userPrompt = `${featurePrompt}\n\n${contextMarkdown}`;
    }

    // Check context size
    const estimatedTokens = estimateTokenCount(systemPrompt + userPrompt);
    if (estimatedTokens > 180000) {
      // Try to compress context
      console.warn('Context too large, compressing...');
      // This would need context object reconstruction
      throw new ContextTooLargeError(
        'Context exceeds maximum size. Please simplify requirements.',
        estimatedTokens,
      );
    }

    // Prepare messages
    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    if (params.streaming) {
      return this.streamGeneration(
        systemPrompt,
        messages,
        params,
      );
    } else {
      return this.generateWithRetry(
        systemPrompt,
        messages,
        params,
      );
    }
  }

  /**
   * Stream generation with retry logic
   */
  private async *streamGeneration(
    systemPrompt: string,
    messages: Anthropic.MessageParam[],
    params: GenerationParams,
  ): AsyncGenerator<string, StreamingResponse> {
    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= this.maxRetries) {
      try {
        const stream = await this.client.messages.create({
          model: this.model,
          max_tokens: params.maxTokens || 8000,
          temperature: params.temperature || 0.7,
          system: systemPrompt,
          messages: messages,
          stream: true,
        });

        const handler = new StreamingResponseHandler();
        let fullText = '';
        let inputTokens = 0;
        let outputTokens = 0;

        for await (const event of stream) {
          if (event.type === 'message_start') {
            inputTokens = event.message.usage.input_tokens;
          } else if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              const chunk = event.delta.text;
              fullText += chunk;
              handler.processChunk(chunk);
              yield chunk;
            }
          } else if (event.type === 'message_delta') {
            outputTokens = event.usage.output_tokens;
          }
        }

        handler.finalize();

        const tokenUsage: TokenUsage = {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        };

        const estimatedCost = CostTracker.calculateCost(tokenUsage, this.model);

        // Track the interaction
        await CostTracker.trackInteraction({
          userId: params.userId,
          projectId: params.projectId,
          type: 'code_generation',
          prompt: systemPrompt.substring(0, 1000) + '...',
          response: fullText.substring(0, 5000),
          tokensUsed: tokenUsage.totalTokens,
          model: this.model,
          estimatedCost,
        });

        await CostTracker.incrementUsage(params.userId);

        return {
          files: handler.getFiles(),
          explanation: handler.getExplanation(),
          tokensUsed: tokenUsage,
          estimatedCost,
        };
      } catch (error) {
        lastError = error as Error;

        if (this.isRetryableError(error)) {
          retries++;
          if (retries <= this.maxRetries) {
            const delay = this.getRetryDelay(retries);
            console.log(`Retrying in ${delay}ms (attempt ${retries}/${this.maxRetries})...`);
            await this.sleep(delay);
            continue;
          }
        }

        throw this.handleError(error);
      }
    }

    throw this.handleError(lastError);
  }

  /**
   * Non-streaming generation with retry logic
   */
  private async generateWithRetry(
    systemPrompt: string,
    messages: Anthropic.MessageParam[],
    params: GenerationParams,
  ): Promise<StreamingResponse> {
    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= this.maxRetries) {
      try {
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: params.maxTokens || 8000,
          temperature: params.temperature || 0.7,
          system: systemPrompt,
          messages: messages,
        });

        const content = response.content[0];
        if (content.type !== 'text') {
          throw new AIError('Unexpected response type', 'INVALID_RESPONSE', 500);
        }

        const fullText = content.text;

        // Parse the response
        const handler = new StreamingResponseHandler();
        handler.processChunk(fullText);
        handler.finalize();

        const tokenUsage: TokenUsage = {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        };

        const estimatedCost = CostTracker.calculateCost(tokenUsage, this.model);

        // Track the interaction
        await CostTracker.trackInteraction({
          userId: params.userId,
          projectId: params.projectId,
          type: 'code_generation',
          prompt: systemPrompt.substring(0, 1000) + '...',
          response: fullText.substring(0, 5000),
          tokensUsed: tokenUsage.totalTokens,
          model: this.model,
          estimatedCost,
        });

        await CostTracker.incrementUsage(params.userId);

        return {
          files: handler.getFiles(),
          explanation: handler.getExplanation(),
          tokensUsed: tokenUsage,
          estimatedCost,
        };
      } catch (error) {
        lastError = error as Error;

        if (this.isRetryableError(error)) {
          retries++;
          if (retries <= this.maxRetries) {
            const delay = this.getRetryDelay(retries);
            console.log(`Retrying in ${delay}ms (attempt ${retries}/${this.maxRetries})...`);
            await this.sleep(delay);
            continue;
          }
        }

        throw this.handleError(error);
      }
    }

    throw this.handleError(lastError);
  }

  /**
   * General chat interface
   */
  async chat(params: ChatParams): Promise<{ response: string; tokensUsed: TokenUsage; estimatedCost: number }> {
    // Check user quota
    const hasQuota = await CostTracker.hasRemainingQuota(params.userId);
    if (!hasQuota) {
      throw new AIError(
        'AI interaction quota exceeded. Please upgrade your plan.',
        'QUOTA_EXCEEDED',
        429,
        false,
      );
    }

    const messages: Anthropic.MessageParam[] = params.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= this.maxRetries) {
      try {
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: params.maxTokens || 4000,
          temperature: params.temperature || 1.0,
          messages: messages,
        });

        const content = response.content[0];
        if (content.type !== 'text') {
          throw new AIError('Unexpected response type', 'INVALID_RESPONSE', 500);
        }

        const tokenUsage: TokenUsage = {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        };

        const estimatedCost = CostTracker.calculateCost(tokenUsage, this.model);

        // Track the interaction
        await CostTracker.trackInteraction({
          userId: params.userId,
          projectId: params.projectId,
          type: 'chat',
          prompt: params.messages[params.messages.length - 1].content,
          response: content.text,
          tokensUsed: tokenUsage.totalTokens,
          model: this.model,
          estimatedCost,
        });

        await CostTracker.incrementUsage(params.userId);

        return {
          response: content.text,
          tokensUsed: tokenUsage,
          estimatedCost,
        };
      } catch (error) {
        lastError = error as Error;

        if (this.isRetryableError(error)) {
          retries++;
          if (retries <= this.maxRetries) {
            const delay = this.getRetryDelay(retries);
            await this.sleep(delay);
            continue;
          }
        }

        throw this.handleError(error);
      }
    }

    throw this.handleError(lastError);
  }

  /**
   * Explain code with context
   */
  async explain(params: ExplainParams): Promise<{ explanation: string; tokensUsed: TokenUsage; estimatedCost: number }> {
    // Check user quota
    const hasQuota = await CostTracker.hasRemainingQuota(params.userId);
    if (!hasQuota) {
      throw new AIError(
        'AI interaction quota exceeded. Please upgrade your plan.',
        'QUOTA_EXCEEDED',
        429,
        false,
      );
    }

    const systemPrompt = `You are FORGE, an AI code expert. Explain code clearly and comprehensively.

When explaining code:
1. Start with a high-level overview
2. Break down key components
3. Explain patterns and techniques
4. Highlight potential improvements
5. Provide relevant context`;

    let userPrompt = `Explain the following ${params.language} code:\n\n\`\`\`${params.language}\n${params.code}\n\`\`\``;

    if (params.context) {
      userPrompt += `\n\nAdditional context: ${params.context}`;
    }

    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= this.maxRetries) {
      try {
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: 2000,
          temperature: 0.7,
          system: systemPrompt,
          messages: messages,
        });

        const content = response.content[0];
        if (content.type !== 'text') {
          throw new AIError('Unexpected response type', 'INVALID_RESPONSE', 500);
        }

        const tokenUsage: TokenUsage = {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        };

        const estimatedCost = CostTracker.calculateCost(tokenUsage, this.model);

        // Track the interaction
        await CostTracker.trackInteraction({
          userId: params.userId,
          type: 'code_explanation',
          prompt: userPrompt.substring(0, 1000),
          response: content.text,
          tokensUsed: tokenUsage.totalTokens,
          model: this.model,
          estimatedCost,
        });

        await CostTracker.incrementUsage(params.userId);

        return {
          explanation: content.text,
          tokensUsed: tokenUsage,
          estimatedCost,
        };
      } catch (error) {
        lastError = error as Error;

        if (this.isRetryableError(error)) {
          retries++;
          if (retries <= this.maxRetries) {
            const delay = this.getRetryDelay(retries);
            await this.sleep(delay);
            continue;
          }
        }

        throw this.handleError(error);
      }
    }

    throw this.handleError(lastError);
  }

  /**
   * Refactor code with specific instructions
   */
  async refactor(
    params: RefactorParams,
  ): Promise<{ refactoredCode: string; explanation: string; tokensUsed: TokenUsage; estimatedCost: number }> {
    // Check user quota
    const hasQuota = await CostTracker.hasRemainingQuota(params.userId);
    if (!hasQuota) {
      throw new AIError(
        'AI interaction quota exceeded. Please upgrade your plan.',
        'QUOTA_EXCEEDED',
        429,
        false,
      );
    }

    const systemPrompt = `You are FORGE, an AI code refactoring expert. Make surgical improvements to code.

When refactoring:
1. Preserve functionality
2. Improve readability and maintainability
3. Follow established patterns
4. Keep changes minimal and focused
5. Explain what changed and why`;

    let userPrompt = `Refactor the following ${params.language} code according to these instructions:\n\n**Instructions:** ${params.instructions}\n\n`;

    if (params.filePath) {
      userPrompt += `**File:** ${params.filePath}\n\n`;
    }

    userPrompt += `\`\`\`${params.language}\n${params.code}\n\`\`\`\n\nReturn the refactored code and explain your changes.`;

    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= this.maxRetries) {
      try {
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: 4000,
          temperature: 0.5,
          system: systemPrompt,
          messages: messages,
        });

        const content = response.content[0];
        if (content.type !== 'text') {
          throw new AIError('Unexpected response type', 'INVALID_RESPONSE', 500);
        }

        const fullText = content.text;

        // Extract code blocks
        const codeBlockRegex = new RegExp(`\`\`\`${params.language}\\n([\\s\\S]*?)\`\`\``, 'g');
        const matches = [...fullText.matchAll(codeBlockRegex)];

        let refactoredCode = params.code; // fallback
        if (matches.length > 0) {
          refactoredCode = matches[matches.length - 1][1].trim();
        }

        const tokenUsage: TokenUsage = {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        };

        const estimatedCost = CostTracker.calculateCost(tokenUsage, this.model);

        // Track the interaction
        await CostTracker.trackInteraction({
          userId: params.userId,
          type: 'refactoring',
          prompt: userPrompt.substring(0, 1000),
          response: fullText.substring(0, 5000),
          tokensUsed: tokenUsage.totalTokens,
          model: this.model,
          estimatedCost,
        });

        await CostTracker.incrementUsage(params.userId);

        return {
          refactoredCode,
          explanation: fullText,
          tokensUsed: tokenUsage,
          estimatedCost,
        };
      } catch (error) {
        lastError = error as Error;

        if (this.isRetryableError(error)) {
          retries++;
          if (retries <= this.maxRetries) {
            const delay = this.getRetryDelay(retries);
            await this.sleep(delay);
            continue;
          }
        }

        throw this.handleError(error);
      }
    }

    throw this.handleError(lastError);
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error instanceof RateLimitError || error instanceof NetworkError) {
      return true;
    }

    // Check for network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true;
    }

    // Check for Anthropic API rate limit errors
    if (error.status === 429 || error.status === 529) {
      return true;
    }

    // Check for server errors (500+)
    if (error.status >= 500) {
      return true;
    }

    return false;
  }

  /**
   * Calculate exponential backoff delay
   */
  private getRetryDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: any): AIError {
    if (error instanceof AIError) {
      return error;
    }

    // Authentication errors
    if (error.status === 401) {
      return new AuthenticationError('Invalid API key. Please check your Anthropic API key.');
    }

    // Rate limit errors
    if (error.status === 429) {
      const retryAfter = error.headers?.['retry-after'];
      return new RateLimitError('Rate limit exceeded. Please try again later.', retryAfter);
    }

    // Context too large
    if (error.status === 400 && error.message?.includes('prompt is too long')) {
      return new ContextTooLargeError('Context exceeds maximum size.', 0);
    }

    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return new NetworkError(`Network error: ${error.message}`);
    }

    // Generic error
    return new AIError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      error.status,
      false,
    );
  }
}

/**
 * Create a singleton instance with environment API key
 */
let defaultClient: ClaudeClient | null = null;

export function getClaudeClient(): ClaudeClient {
  if (!defaultClient) {
    defaultClient = new ClaudeClient();
  }
  return defaultClient;
}

/**
 * Export helper functions
 */
export { CostTracker, StreamingResponseHandler, createStreamingHandler };
export * from './types';
export * from './context-builder';
