/**
 * FORGE Context Builder
 * Combines project memory, decisions, and feature requirements into
 * structured context for Claude to generate accurate, consistent code
 */

import {
  GenerationContext,
  ProjectMemory,
  Decision,
  ExistingFile,
  ProductionMode,
} from './types';

/**
 * Build generation context from project data
 */
export function buildGenerationContext(
  project: {
    id: string;
    name: string;
    description?: string | null;
    appType?: string | null;
    techStack?: any;
    architecture?: string | null;
    businessRules?: any;
    complianceRequirements?: any;
    securityRequirements?: any;
    performanceTargets?: any;
    designSystem?: any;
    apiContracts?: any;
    productionMode: string;
  },
  feature: {
    id: string;
    name: string;
    description?: string | null;
    category: string;
    requirements?: any;
  },
  memories: ProjectMemory[],
  decisions: Decision[],
  existingFiles?: ExistingFile[],
): GenerationContext {
  return {
    projectInfo: {
      name: project.name,
      description: project.description || undefined,
      appType: project.appType || undefined,
      techStack: project.techStack,
      architecture: project.architecture || undefined,
    },
    productionMode: (project.productionMode as ProductionMode) || 'startup',
    memories: memories,
    decisions: decisions,
    feature: {
      name: feature.name,
      description: feature.description || '',
      category: feature.category,
      requirements: feature.requirements || {},
    },
    existingFiles: existingFiles,
  };
}

/**
 * Format context as markdown for Claude
 */
export function formatContextAsMarkdown(context: GenerationContext): string {
  const sections: string[] = [];

  // Project Information
  sections.push('# Project Context\n');
  sections.push(`**Project Name:** ${context.projectInfo.name}\n`);

  if (context.projectInfo.description) {
    sections.push(`**Description:** ${context.projectInfo.description}\n`);
  }

  if (context.projectInfo.appType) {
    sections.push(`**App Type:** ${context.projectInfo.appType}\n`);
  }

  if (context.projectInfo.architecture) {
    sections.push(`**Architecture:** ${context.projectInfo.architecture}\n`);
  }

  sections.push(`**Production Mode:** ${context.productionMode}\n`);

  // Tech Stack
  if (context.projectInfo.techStack) {
    sections.push('\n## Tech Stack\n');
    const techStack = context.projectInfo.techStack;

    if (typeof techStack === 'object') {
      Object.entries(techStack).forEach(([key, value]) => {
        sections.push(`- **${key}:** ${value}\n`);
      });
    } else {
      sections.push(`${techStack}\n`);
    }
  }

  // Project Memories
  if (context.memories.length > 0) {
    sections.push('\n## Project Memory\n');
    sections.push(
      'These are persistent decisions and context about this project. Follow these closely.\n\n',
    );

    // Group memories by category
    const memoriesByCategory = context.memories.reduce((acc, memory) => {
      if (!acc[memory.category]) {
        acc[memory.category] = [];
      }
      acc[memory.category].push(memory);
      return acc;
    }, {} as Record<string, ProjectMemory[]>);

    Object.entries(memoriesByCategory).forEach(([category, mems]) => {
      sections.push(`### ${formatCategoryName(category)}\n`);

      mems.forEach((memory) => {
        sections.push(`**${memory.title}**\n`);

        if (typeof memory.content === 'object') {
          sections.push('```json\n');
          sections.push(JSON.stringify(memory.content, null, 2));
          sections.push('\n```\n');
        } else {
          sections.push(`${memory.content}\n`);
        }

        if (memory.reasoning) {
          sections.push(`*Reasoning:* ${memory.reasoning}\n`);
        }

        sections.push('\n');
      });
    });
  }

  // Decisions
  if (context.decisions.length > 0) {
    sections.push('\n## Architectural Decisions\n');
    sections.push(
      'These decisions have been made for this project. Follow them in your implementation.\n\n',
    );

    // Group decisions by category
    const decisionsByCategory = context.decisions.reduce((acc, decision) => {
      if (!acc[decision.category]) {
        acc[decision.category] = [];
      }
      acc[decision.category].push(decision);
      return acc;
    }, {} as Record<string, Decision[]>);

    Object.entries(decisionsByCategory).forEach(([category, decs]) => {
      sections.push(`### ${formatCategoryName(category)}\n`);

      decs.forEach((decision) => {
        sections.push(`**${decision.title}**\n`);
        sections.push(`${decision.description}\n\n`);

        const selected = decision.selectedOption || decision.recommendedOption;
        sections.push(`**Chosen Approach:** ${selected}\n\n`);

        if (decision.costImplications) {
          sections.push(`*Cost:* ${decision.costImplications}\n`);
        }
        if (decision.performanceImplications) {
          sections.push(`*Performance:* ${decision.performanceImplications}\n`);
        }
        if (decision.securityImplications) {
          sections.push(`*Security:* ${decision.securityImplications}\n`);
        }

        sections.push('\n');
      });
    });
  }

  // Feature Requirements
  sections.push('\n# Feature to Implement\n');
  sections.push(`**Feature Name:** ${context.feature.name}\n`);
  sections.push(`**Category:** ${context.feature.category}\n`);

  if (context.feature.description) {
    sections.push(`**Description:** ${context.feature.description}\n`);
  }

  if (context.feature.requirements && Object.keys(context.feature.requirements).length > 0) {
    sections.push('\n## Feature Requirements\n');

    Object.entries(context.feature.requirements).forEach(([key, value]) => {
      const formattedKey = formatCategoryName(key);

      if (typeof value === 'object' && !Array.isArray(value)) {
        sections.push(`### ${formattedKey}\n`);
        Object.entries(value as Record<string, any>).forEach(([subKey, subValue]) => {
          sections.push(`- **${formatCategoryName(subKey)}:** ${subValue}\n`);
        });
      } else if (Array.isArray(value)) {
        sections.push(`### ${formattedKey}\n`);
        value.forEach((item) => {
          sections.push(`- ${item}\n`);
        });
      } else {
        sections.push(`**${formattedKey}:** ${value}\n`);
      }
    });
  }

  // Existing Files (if modifying existing code)
  if (context.existingFiles && context.existingFiles.length > 0) {
    sections.push('\n## Existing Files to Modify\n');
    sections.push(
      'These files already exist. Your changes should integrate with or modify them.\n\n',
    );

    context.existingFiles.forEach((file) => {
      sections.push(`### ${file.path}\n`);

      if (file.purpose) {
        sections.push(`*Purpose:* ${file.purpose}\n\n`);
      }

      sections.push(`\`\`\`${file.language}\n`);
      sections.push(file.content);
      sections.push('\n```\n\n');
    });
  }

  // File Tree (if provided)
  if (context.fileTree) {
    sections.push('\n## Project File Structure\n');
    sections.push('```\n');
    sections.push(context.fileTree);
    sections.push('\n```\n');
  }

  return sections.join('');
}

/**
 * Generate file tree structure from existing files
 */
export function generateFileTree(files: ExistingFile[]): string {
  const tree: Record<string, any> = {};

  files.forEach((file) => {
    const parts = file.path.split('/');
    let current = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // File
        current[part] = 'file';
      } else {
        // Directory
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    });
  });

  return formatTree(tree, 0);
}

/**
 * Format tree structure as text
 */
function formatTree(tree: Record<string, any>, level: number): string {
  const indent = '  '.repeat(level);
  const lines: string[] = [];

  Object.entries(tree).forEach(([key, value]) => {
    if (value === 'file') {
      lines.push(`${indent}${key}`);
    } else {
      lines.push(`${indent}${key}/`);
      lines.push(formatTree(value, level + 1));
    }
  });

  return lines.join('\n');
}

/**
 * Format category name for display
 */
function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Compress context if it's too large
 * This is called when context exceeds token limits
 */
export function compressContext(context: GenerationContext): GenerationContext {
  const compressed = { ...context };

  // Keep only essential memories
  compressed.memories = context.memories
    .filter((m) => m.category === 'blueprint' || m.category === 'tech_stack')
    .slice(0, 5);

  // Keep only approved decisions
  compressed.decisions = context.decisions
    .filter((d) => d.status === 'approved')
    .slice(0, 10);

  // Remove existing files (most verbose)
  compressed.existingFiles = undefined;

  // Remove file tree
  compressed.fileTree = undefined;

  return compressed;
}

/**
 * Estimate token count for context (rough approximation)
 * Claude uses ~4 characters per token on average
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if context is within token limits
 */
export function isWithinTokenLimit(
  context: GenerationContext,
  maxTokens: number = 100000,
): boolean {
  const markdown = formatContextAsMarkdown(context);
  const estimatedTokens = estimateTokenCount(markdown);

  return estimatedTokens <= maxTokens;
}

/**
 * Build minimal context (for simpler operations like explanations)
 */
export function buildMinimalContext(
  projectName: string,
  techStack?: any,
): Partial<GenerationContext> {
  return {
    projectInfo: {
      name: projectName,
      techStack: techStack,
    },
    memories: [],
    decisions: [],
  };
}

/**
 * Extract relevant memories for a specific feature category
 */
export function filterRelevantMemories(
  memories: ProjectMemory[],
  featureCategory: string,
): ProjectMemory[] {
  const categoryKeywords: Record<string, string[]> = {
    authentication: ['auth', 'security', 'user', 'session'],
    payment: ['payment', 'stripe', 'billing', 'subscription'],
    dashboard: ['analytics', 'metrics', 'chart', 'visualization'],
    api: ['api', 'endpoint', 'backend', 'server'],
    crud: ['database', 'model', 'data'],
  };

  const keywords = categoryKeywords[featureCategory.toLowerCase()] || [];

  return memories.filter((memory) => {
    // Always include tech_stack and blueprint
    if (memory.category === 'tech_stack' || memory.category === 'blueprint') {
      return true;
    }

    // Check if memory is relevant to feature
    const contentStr = JSON.stringify(memory.content).toLowerCase();
    const titleStr = memory.title.toLowerCase();

    return keywords.some((keyword) => contentStr.includes(keyword) || titleStr.includes(keyword));
  });
}

/**
 * Extract relevant decisions for a specific feature category
 */
export function filterRelevantDecisions(
  decisions: Decision[],
  featureCategory: string,
): Decision[] {
  const categoryKeywords: Record<string, string[]> = {
    authentication: ['authentication', 'authorization', 'security', 'session'],
    payment: ['payment', 'billing', 'subscription'],
    dashboard: ['data', 'analytics', 'visualization'],
    api: ['api', 'backend', 'data_architecture'],
    crud: ['data_architecture', 'database'],
  };

  const keywords = categoryKeywords[featureCategory.toLowerCase()] || [];

  return decisions.filter((decision) => {
    // Include all approved decisions from matching categories
    if (keywords.includes(decision.category.toLowerCase())) {
      return true;
    }

    // Check description
    const descStr = decision.description.toLowerCase();
    return keywords.some((keyword) => descStr.includes(keyword));
  });
}

/**
 * Optimize context by filtering relevant information
 */
export function optimizeContext(context: GenerationContext): GenerationContext {
  return {
    ...context,
    memories: filterRelevantMemories(context.memories, context.feature.category),
    decisions: filterRelevantDecisions(context.decisions, context.feature.category),
  };
}
