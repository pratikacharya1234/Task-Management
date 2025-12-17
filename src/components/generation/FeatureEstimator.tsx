'use client'

import { AlertTriangle, CheckCircle, DollarSign, FileCode, Timer, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { FeatureType } from './FeatureTypeSelector'
import type { ProductionMode } from '@/lib/types'

export interface GenerationEstimate {
  files: {
    frontend: number
    backend: number
    database: number
    validation: number
    tests: number
    docs: number
    total: number
  }
  linesOfCode: number
  tokens: {
    input: number
    output: number
    total: number
  }
  cost: number
  estimatedTime: number // seconds
}

interface FeatureEstimatorProps {
  feature: {
    type: FeatureType
    name: string
    description: string
    userStories?: string[]
  }
  mode: ProductionMode
  onModeChange?: (mode: ProductionMode) => void
}

export function FeatureEstimator({ feature, mode, onModeChange }: FeatureEstimatorProps) {
  const estimate = calculateEstimate(feature, mode)
  const isHighCost = estimate.cost > 10
  const isVeryHighCost = estimate.cost > 25

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-heading text-forge-cream mb-2">
          Generation Estimate
        </h3>
        <p className="text-sm text-forge-beige">
          Preview what will be generated for {feature.name}
        </p>
      </div>

      {/* Files breakdown */}
      <div className="border border-forge-taupe rounded-lg p-6 space-y-4">
        <h4 className="font-medium text-forge-cream flex items-center gap-2">
          <FileCode className="w-4 h-4 text-forge-copper" />
          What will be generated
        </h4>

        <div className="space-y-2">
          <FileTypeRow
            label="Frontend Components"
            count={estimate.files.frontend}
            icon="✓"
          />
          <FileTypeRow
            label="Backend API Endpoints"
            count={estimate.files.backend}
            icon="✓"
          />
          <FileTypeRow
            label="Database Schema"
            count={estimate.files.database}
            icon="✓"
          />
          <FileTypeRow
            label="Validation Schemas"
            count={estimate.files.validation}
            icon="✓"
          />
          <FileTypeRow
            label="Tests"
            count={estimate.files.tests}
            icon="✓"
          />
          <FileTypeRow
            label="Documentation"
            count={estimate.files.docs}
            icon="✓"
          />

          <div className="border-t border-forge-taupe pt-2 mt-2">
            <FileTypeRow
              label="Total"
              count={estimate.files.total}
              icon="="
              bold
            />
            <div className="text-xs text-forge-beige mt-1">
              ~{estimate.linesOfCode.toLocaleString()} lines of code
            </div>
          </div>
        </div>
      </div>

      {/* Cost & time estimate */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tokens */}
        <div className="border border-forge-taupe rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-forge-copper" />
            <div className="text-sm font-medium text-forge-cream">Tokens</div>
          </div>
          <div className="text-2xl font-heading text-forge-cream">
            {estimate.tokens.total.toLocaleString()}
          </div>
          <div className="text-xs text-forge-beige mt-1">
            {estimate.tokens.input.toLocaleString()} in +{' '}
            {estimate.tokens.output.toLocaleString()} out
          </div>
        </div>

        {/* Cost */}
        <div className="border border-forge-taupe rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-forge-copper" />
            <div className="text-sm font-medium text-forge-cream">Cost</div>
          </div>
          <div className="text-2xl font-heading text-forge-cream">
            ${estimate.cost.toFixed(2)}
          </div>
          <div className="text-xs text-forge-beige mt-1">
            Estimated API cost
          </div>
        </div>
      </div>

      {/* Time estimate */}
      <div className="border border-forge-taupe rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-forge-copper" />
            <div className="text-sm font-medium text-forge-cream">
              Estimated Time
            </div>
          </div>
          <Badge variant="secondary">
            {formatTime(estimate.estimatedTime)}
          </Badge>
        </div>
      </div>

      {/* Production mode */}
      <div className="border border-forge-taupe rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-forge-cream">
            Production Mode
          </div>
          <Badge
            variant="outline"
            className={getModeColor(mode)}
          >
            {mode.toUpperCase()}
          </Badge>
        </div>
        <div className="text-xs text-forge-beige">
          {getModeDescription(mode)}
        </div>
      </div>

      {/* Warnings */}
      {isVeryHighCost && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Very High Cost</AlertTitle>
          <AlertDescription>
            This will use significant tokens (${estimate.cost.toFixed(2)}). Consider
            breaking this into smaller features to reduce cost and improve quality.
          </AlertDescription>
        </Alert>
      )}

      {!isVeryHighCost && isHighCost && (
        <Alert className="border-yellow-500/20 bg-yellow-500/5">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">High Cost Warning</AlertTitle>
          <AlertDescription className="text-yellow-300">
            This generation will cost ${estimate.cost.toFixed(2)}. Make sure your
            feature description is clear to avoid regenerations.
          </AlertDescription>
        </Alert>
      )}

      {!isHighCost && (
        <Alert className="border-green-500/20 bg-green-500/5">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <AlertTitle className="text-green-500">Ready to Generate</AlertTitle>
          <AlertDescription className="text-green-300">
            Cost is reasonable (${estimate.cost.toFixed(2)}). You can proceed with
            generation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function FileTypeRow({
  label,
  count,
  icon,
  bold = false,
}: {
  label: string
  count: number
  icon: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className={`flex items-center gap-2 ${bold ? 'font-medium' : ''}`}>
        <span className="text-forge-copper">{icon}</span>
        <span className="text-forge-cream">{label}</span>
      </div>
      <div className={`text-forge-beige ${bold ? 'font-medium' : ''}`}>
        estimated: {count} {count === 1 ? 'file' : 'files'}
      </div>
    </div>
  )
}

function calculateEstimate(
  feature: { type: FeatureType; name: string; description: string; userStories?: string[] },
  mode: ProductionMode
): GenerationEstimate {
  // Base estimates by feature type
  const baseEstimates: Record<FeatureType, Partial<GenerationEstimate['files']>> = {
    AUTH: { frontend: 5, backend: 3, database: 2, validation: 3, tests: 8, docs: 1 },
    CRUD: { frontend: 4, backend: 4, database: 2, validation: 3, tests: 6, docs: 1 },
    DASHBOARD: { frontend: 8, backend: 5, database: 3, validation: 2, tests: 10, docs: 1 },
    PAYMENT: { frontend: 6, backend: 5, database: 3, validation: 4, tests: 9, docs: 2 },
    API: { frontend: 3, backend: 5, database: 1, validation: 3, tests: 7, docs: 1 },
    UPLOAD: { frontend: 5, backend: 4, database: 2, validation: 3, tests: 8, docs: 1 },
    SEARCH: { frontend: 6, backend: 5, database: 2, validation: 2, tests: 8, docs: 1 },
    NOTIFICATION: { frontend: 5, backend: 6, database: 3, validation: 3, tests: 9, docs: 1 },
    CUSTOM: { frontend: 4, backend: 4, database: 2, validation: 2, tests: 6, docs: 1 },
  }

  const base = baseEstimates[feature.type] || baseEstimates.CUSTOM

  // Adjust based on mode
  const modeMultipliers: Record<ProductionMode, number> = {
    mvp: 0.7,
    startup: 1.0,
    enterprise: 1.5,
  }

  const multiplier = modeMultipliers[mode]

  const files = {
    frontend: Math.round((base.frontend || 0) * multiplier),
    backend: Math.round((base.backend || 0) * multiplier),
    database: Math.round((base.database || 0) * multiplier),
    validation: Math.round((base.validation || 0) * multiplier),
    tests: Math.round((base.tests || 0) * multiplier),
    docs: Math.round((base.docs || 0) * multiplier),
    total: 0,
  }

  files.total =
    files.frontend +
    files.backend +
    files.database +
    files.validation +
    files.tests +
    files.docs

  // Estimate lines of code (avg ~80 lines per file)
  const linesOfCode = files.total * 80

  // Estimate tokens (rough: 1 token ≈ 4 chars, 80 chars per line)
  const inputTokens = Math.round(linesOfCode * 20 * 0.25) // context + instructions
  const outputTokens = Math.round(linesOfCode * 80 * 0.25) // generated code

  const tokens = {
    input: inputTokens,
    output: outputTokens,
    total: inputTokens + outputTokens,
  }

  // Cost calculation (Sonnet pricing: $3/1M input, $15/1M output)
  const cost =
    (inputTokens / 1_000_000) * 3 +
    (outputTokens / 1_000_000) * 15

  // Estimated time (roughly 1000 tokens per second)
  const estimatedTime = Math.round(tokens.total / 1000)

  return {
    files,
    linesOfCode,
    tokens,
    cost,
    estimatedTime,
  }
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (remainingSeconds === 0) {
    return `${minutes}m`
  }

  return `${minutes}m ${remainingSeconds}s`
}

function getModeColor(mode: ProductionMode): string {
  switch (mode) {
    case 'mvp':
      return 'border-blue-500 text-blue-500'
    case 'startup':
      return 'border-green-500 text-green-500'
    case 'enterprise':
      return 'border-purple-500 text-purple-500'
  }
}

function getModeDescription(mode: ProductionMode): string {
  switch (mode) {
    case 'mvp':
      return 'Fast iteration, basic quality, minimal tests'
    case 'startup':
      return 'Balanced quality, good tests, production-ready'
    case 'enterprise':
      return 'Maximum quality, comprehensive tests, compliance-ready'
  }
}
