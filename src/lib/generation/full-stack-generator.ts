import {
  GenerateFeatureParams,
  GenerationResult,
  GeneratedFile,
  ProgressUpdate,
  ValidationWarning,
  Change,
} from './types'
import { CodeFormatter } from './formatter'
import { FileManager } from './file-manager'
import { TestGenerator } from './test-generator'
import { DocumentationGenerator } from './documentation-generator'
import {
  validateTypeScript,
  validateFileStructure,
  validateSecurity,
  validateAccessibility,
  validatePerformance,
  validateTests,
} from './validation'

export class FullStackGenerator {
  private formatter = new CodeFormatter()
  private fileManager = new FileManager()
  private testGenerator = new TestGenerator()
  private docGenerator = new DocumentationGenerator()

  /**
   * Main method to generate a complete feature
   */
  async generateFeature(params: GenerateFeatureParams): Promise<GenerationResult> {
    const startTime = Date.now()
    const { project, feature, mode = project.productionMode, onProgress } = params

    try {
      // 1. Validate prerequisites
      onProgress?.({ stage: 'validating', progress: 5, message: 'Checking prerequisites...' })
      await this.validatePrerequisites(project)

      // 2. Build generation context
      onProgress?.({ stage: 'preparing', progress: 10, message: 'Building context...' })
      const context = {
        project,
        memory: project.memories || [],
        decisions: project.decisions || [],
        feature,
        mode: mode || 'startup',
      }

      // 3. Generate files (streaming)
      onProgress?.({ stage: 'generating', progress: 20, message: 'Generating database schema...' })
      const files: GeneratedFile[] = []

      // In a real implementation, this would call ClaudeClient.generateCode()
      // For now, we'll create placeholder files
      const generatedFiles = await this.generatePlaceholderFiles(feature, context)
      files.push(...generatedFiles)

      onProgress?.({ stage: 'generating', progress: 40, message: 'Creating API endpoints...' })
      onProgress?.({ stage: 'generating', progress: 60, message: 'Building UI components...' })

      // 4. Generate tests
      if (mode === 'enterprise' || mode === 'startup') {
        onProgress?.({ stage: 'testing', progress: 70, message: 'Writing tests...' })
        for (const file of files.filter((f) => f.type !== 'test')) {
          const tests = await this.testGenerator.generateTests(file, context)
          files.push(...tests)
        }
      }

      // 5. Generate documentation
      onProgress?.({ stage: 'documenting', progress: 80, message: 'Generating documentation...' })
      const doc = await this.docGenerator.generateFeatureDocumentation(feature, files)
      files.push(doc)

      // 6. Post-process files
      onProgress?.({ stage: 'validating', progress: 85, message: 'Validating generated code...' })
      const warnings = await this.validateGeneratedFiles(files, mode)

      // 7. Format files
      onProgress?.({ stage: 'validating', progress: 90, message: 'Formatting code...' })
      const formattedFiles = await this.formatter.formatFiles(files)

      // 8. Save to database
      onProgress?.({ stage: 'saving', progress: 95, message: 'Saving files...' })
      const savedFiles = await this.fileManager.bulkSave(
        project.id,
        formattedFiles,
        `Generated ${feature.name} feature`
      )

      // 9. Create Change record
      const change: Change = {
        id: Math.random().toString(36).substring(7),
        projectId: project.id,
        description: `Generated ${feature.name} feature`,
        reasoning: `Created full-stack implementation for ${feature.type} feature with ${files.length} files`,
        filesAffected: files.map((f) => f.path),
        createdAt: new Date(),
        createdBy: 'ai',
      }

      // 10. Calculate metrics
      const endTime = Date.now()
      const linesOfCode = files.reduce(
        (sum, f) => sum + f.content.split('\n').length,
        0
      )

      onProgress?.({ stage: 'complete', progress: 100, message: 'Generation complete!' })

      return {
        success: true,
        files: formattedFiles,
        change,
        warnings,
        metrics: {
          filesGenerated: files.length,
          linesOfCode,
          tokensUsed: this.estimateTokens(files),
          costUSD: this.estimateCost(files),
          timeSeconds: (endTime - startTime) / 1000,
        },
      }
    } catch (error) {
      return {
        success: false,
        files: [],
        change: {} as Change,
        warnings: [],
        metrics: {
          filesGenerated: 0,
          linesOfCode: 0,
          tokensUsed: 0,
          costUSD: 0,
          timeSeconds: (Date.now() - startTime) / 1000,
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Validate prerequisites before generation
   */
  private async validatePrerequisites(project: any): Promise<void> {
    // Check required decisions are made
    const requiredDecisions = ['database', 'auth', 'deployment']
    const madeDecisions = project.decisions
      ?.filter((d: any) => d.status === 'approved')
      .map((d: any) => d.category) || []

    const missingDecisions = requiredDecisions.filter(
      (req) => !madeDecisions.includes(req)
    )

    if (missingDecisions.length > 0) {
      throw new Error(
        `Missing required decisions: ${missingDecisions.join(', ')}. Please approve these decisions first.`
      )
    }

    // Check environment is ready
    // In real implementation, would check database connection, API keys, etc.
  }

  /**
   * Generate placeholder files (in real implementation, would call AI)
   */
  private async generatePlaceholderFiles(
    feature: any,
    context: any
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = []

    // Generate component
    files.push({
      path: `src/components/${feature.name}.tsx`,
      content: this.generatePlaceholderComponent(feature.name),
      language: 'typescript',
      type: 'component',
      explanation: `Main component for ${feature.name} feature`,
    })

    // Generate API route
    files.push({
      path: `src/app/api/${feature.name.toLowerCase()}/route.ts`,
      content: this.generatePlaceholderApi(feature.name),
      language: 'typescript',
      type: 'api',
      explanation: `API endpoint for ${feature.name} feature`,
    })

    // Generate types
    files.push({
      path: `src/types/${feature.name.toLowerCase()}.ts`,
      content: this.generatePlaceholderTypes(feature.name),
      language: 'typescript',
      type: 'type',
      explanation: `Type definitions for ${feature.name} feature`,
    })

    return files
  }

  /**
   * Validate all generated files
   */
  private async validateGeneratedFiles(
    files: GeneratedFile[],
    mode: string
  ): Promise<ValidationWarning[]> {
    const warnings: ValidationWarning[] = []

    // Validate each file
    for (const file of files) {
      if (file.language === 'typescript' || file.language === 'tsx') {
        const tsResult = validateTypeScript(file.content)
        warnings.push(...tsResult.warnings.map(this.convertToWarning))
        warnings.push(...tsResult.errors.map(this.convertToWarning))
      }

      const securityResult = validateSecurity(file.content, file.language)
      warnings.push(...securityResult.errors.map(this.convertToWarning))

      if (file.type === 'component') {
        const a11yResult = validateAccessibility(file.content)
        warnings.push(...a11yResult.warnings.map(this.convertToWarning))

        const perfResult = validatePerformance(file.content, file.language)
        warnings.push(...perfResult.warnings.map(this.convertToWarning))
      }
    }

    // Validate file structure
    const structureResult = validateFileStructure(files)
    warnings.push(...structureResult.warnings.map(this.convertToWarning))

    // Validate tests
    if (mode !== 'mvp') {
      const testResult = validateTests(files)
      warnings.push(...testResult.warnings.map(this.convertToWarning))
    }

    return warnings
  }

  /**
   * Convert validation issue to warning
   */
  private convertToWarning(issue: any): ValidationWarning {
    return {
      severity: issue.severity,
      message: issue.message,
      file: issue.file,
      line: issue.line,
      column: issue.column,
      code: issue.code,
      fix: issue.fix,
    }
  }

  /**
   * Estimate token usage
   */
  private estimateTokens(files: GeneratedFile[]): number {
    const totalChars = files.reduce((sum, f) => sum + f.content.length, 0)
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(totalChars / 4)
  }

  /**
   * Estimate cost
   */
  private estimateCost(files: GeneratedFile[]): number {
    const tokens = this.estimateTokens(files)
    // Rough estimate: $0.01 per 1000 tokens
    return (tokens / 1000) * 0.01
  }

  /**
   * Generate placeholder component
   */
  private generatePlaceholderComponent(name: string): string {
    return `'use client'

export function ${name}() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">${name}</h1>
      <p>This is the ${name} component.</p>
    </div>
  )
}
`
  }

  /**
   * Generate placeholder API
   */
  private generatePlaceholderApi(name: string): string {
    return `import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: '${name} API' })
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  return NextResponse.json({ success: true, data })
}
`
  }

  /**
   * Generate placeholder types
   */
  private generatePlaceholderTypes(name: string): string {
    return `export interface ${name}Data {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface ${name}CreateInput {
  name: string
}

export interface ${name}UpdateInput {
  name?: string
}
`
  }
}
