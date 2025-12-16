/**
 * FORGE Cost Tracking System
 * Track AI usage, tokens, and costs per request
 */

import { PrismaClient } from '@prisma/client';
import {
  TokenUsage,
  CostMetrics,
  ClaudeModel,
  MODEL_PRICING,
  AIInteractionData,
} from './types';

const prisma = new PrismaClient();

export class CostTracker {
  /**
   * Calculate cost in USD based on token usage and model
   */
  static calculateCost(tokens: TokenUsage, model: ClaudeModel): number {
    const pricing = MODEL_PRICING[model];
    if (!pricing) {
      throw new Error(`Unknown model: ${model}`);
    }

    const inputCost = (tokens.inputTokens / 1_000_000) * pricing.input;
    const outputCost = (tokens.outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  /**
   * Track an AI interaction in the database
   */
  static async trackInteraction(data: AIInteractionData): Promise<string> {
    try {
      const interaction = await prisma.aIInteraction.create({
        data: {
          userId: data.userId,
          projectId: data.projectId,
          type: data.type,
          prompt: data.prompt,
          response: data.response,
          tokensUsed: data.tokensUsed,
          model: data.model,
          estimatedCost: data.estimatedCost,
        },
      });

      return interaction.id;
    } catch (error) {
      console.error('Failed to track AI interaction:', error);
      throw error;
    }
  }

  /**
   * Get total cost for a user in a given time period
   */
  static async getUserCost(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const interactions = await prisma.aIInteraction.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          estimatedCost: true,
        },
      });

      return interactions.reduce((sum, interaction) => sum + interaction.estimatedCost, 0);
    } catch (error) {
      console.error('Failed to get user cost:', error);
      throw error;
    }
  }

  /**
   * Get total cost for a project
   */
  static async getProjectCost(
    projectId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    try {
      const where: any = { projectId };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const interactions = await prisma.aIInteraction.findMany({
        where,
        select: {
          estimatedCost: true,
        },
      });

      return interactions.reduce((sum, interaction) => sum + interaction.estimatedCost, 0);
    } catch (error) {
      console.error('Failed to get project cost:', error);
      throw error;
    }
  }

  /**
   * Get monthly cost analytics for a user
   */
  static async getMonthlyAnalytics(userId: string, year: number, month: number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const interactions = await prisma.aIInteraction.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          type: true,
          tokensUsed: true,
          estimatedCost: true,
          model: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Aggregate by type
      const byType: Record<string, { count: number; tokens: number; cost: number }> = {};

      interactions.forEach((interaction) => {
        if (!byType[interaction.type]) {
          byType[interaction.type] = { count: 0, tokens: 0, cost: 0 };
        }
        byType[interaction.type].count++;
        byType[interaction.type].tokens += interaction.tokensUsed;
        byType[interaction.type].cost += interaction.estimatedCost;
      });

      // Aggregate by model
      const byModel: Record<string, { count: number; tokens: number; cost: number }> = {};

      interactions.forEach((interaction) => {
        if (!byModel[interaction.model]) {
          byModel[interaction.model] = { count: 0, tokens: 0, cost: 0 };
        }
        byModel[interaction.model].count++;
        byModel[interaction.model].tokens += interaction.tokensUsed;
        byModel[interaction.model].cost += interaction.estimatedCost;
      });

      // Calculate daily breakdown
      const dailyBreakdown: Record<string, { count: number; tokens: number; cost: number }> = {};

      interactions.forEach((interaction) => {
        const day = interaction.createdAt.toISOString().split('T')[0];
        if (!dailyBreakdown[day]) {
          dailyBreakdown[day] = { count: 0, tokens: 0, cost: 0 };
        }
        dailyBreakdown[day].count++;
        dailyBreakdown[day].tokens += interaction.tokensUsed;
        dailyBreakdown[day].cost += interaction.estimatedCost;
      });

      const totalCost = interactions.reduce((sum, i) => sum + i.estimatedCost, 0);
      const totalTokens = interactions.reduce((sum, i) => sum + i.tokensUsed, 0);

      return {
        period: {
          year,
          month,
          startDate,
          endDate,
        },
        summary: {
          totalInteractions: interactions.length,
          totalTokens,
          totalCost,
          averageCostPerInteraction: interactions.length > 0 ? totalCost / interactions.length : 0,
        },
        byType,
        byModel,
        dailyBreakdown,
      };
    } catch (error) {
      console.error('Failed to get monthly analytics:', error);
      throw error;
    }
  }

  /**
   * Get usage statistics for a user in the current billing period
   */
  static async getCurrentUsage(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          aiInteractionsUsed: true,
          aiInteractionsLimit: true,
          resetDate: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const now = new Date();
      const resetDate = new Date(user.resetDate);

      // Check if we need to reset the counter
      const shouldReset = now >= resetDate;

      if (shouldReset) {
        // Reset the counter and set new reset date (next month)
        const nextResetDate = new Date(now);
        nextResetDate.setMonth(nextResetDate.getMonth() + 1);
        nextResetDate.setDate(1);
        nextResetDate.setHours(0, 0, 0, 0);

        await prisma.user.update({
          where: { id: userId },
          data: {
            aiInteractionsUsed: 0,
            resetDate: nextResetDate,
          },
        });

        return {
          used: 0,
          limit: user.aiInteractionsLimit,
          remaining: user.aiInteractionsLimit,
          resetDate: nextResetDate,
          percentUsed: 0,
        };
      }

      const remaining = user.aiInteractionsLimit - user.aiInteractionsUsed;
      const percentUsed = (user.aiInteractionsUsed / user.aiInteractionsLimit) * 100;

      return {
        used: user.aiInteractionsUsed,
        limit: user.aiInteractionsLimit,
        remaining: Math.max(0, remaining),
        resetDate: user.resetDate,
        percentUsed,
      };
    } catch (error) {
      console.error('Failed to get current usage:', error);
      throw error;
    }
  }

  /**
   * Increment the usage counter for a user
   */
  static async incrementUsage(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          aiInteractionsUsed: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error('Failed to increment usage:', error);
      throw error;
    }
  }

  /**
   * Check if user has remaining quota
   */
  static async hasRemainingQuota(userId: string): Promise<boolean> {
    const usage = await this.getCurrentUsage(userId);
    return usage.remaining > 0;
  }

  /**
   * Get cost metrics for a specific interaction
   */
  static createMetrics(
    tokens: TokenUsage,
    model: ClaudeModel,
  ): CostMetrics {
    return {
      tokensUsed: tokens,
      estimatedCost: this.calculateCost(tokens, model),
      model,
      timestamp: new Date(),
    };
  }

  /**
   * Format cost for display (e.g., "$0.0123" or "$1.23")
   */
  static formatCost(cost: number): string {
    if (cost < 0.01) {
      return `$${cost.toFixed(4)}`;
    }
    return `$${cost.toFixed(2)}`;
  }

  /**
   * Format token count for display (e.g., "1.2K" or "1.5M")
   */
  static formatTokenCount(tokens: number): string {
    if (tokens >= 1_000_000) {
      return `${(tokens / 1_000_000).toFixed(1)}M`;
    }
    if (tokens >= 1_000) {
      return `${(tokens / 1_000).toFixed(1)}K`;
    }
    return tokens.toString();
  }
}

/**
 * Utility function to create cost tracking middleware
 */
export function createCostTrackingMiddleware() {
  return async (data: AIInteractionData) => {
    try {
      // Check if user has quota
      const hasQuota = await CostTracker.hasRemainingQuota(data.userId);

      if (!hasQuota) {
        throw new Error('AI interaction quota exceeded. Please upgrade your plan.');
      }

      // Track the interaction
      const interactionId = await CostTracker.trackInteraction(data);

      // Increment usage counter
      await CostTracker.incrementUsage(data.userId);

      return interactionId;
    } catch (error) {
      console.error('Cost tracking middleware error:', error);
      throw error;
    }
  };
}
