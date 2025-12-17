'use client'

import { useState } from 'react'
import { CheckCircle, DollarSign, FileCode, Timer, Zap, X } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface GenerationStage {
  id: string
  label: string
  icon: string
  message: string
  progress: number
}

export interface GeneratedFile {
  path: string
  language: string
  size: number
}

export interface GenerationMetrics {
  files: number
  lines: number
  tokens: number
  cost: number
  time: number // seconds
}

interface GenerationProgressProps {
  progress: number
  stage: GenerationStage
  files: GeneratedFile[]
  metrics: GenerationMetrics
  reasoning: string[]
  onCancel?: () => void
}

const STAGES: Omit<GenerationStage, 'message' | 'progress'>[] = [
  { id: 'validate', label: 'Validate', icon: 'CHK' },
  { id: 'context', label: 'Context', icon: 'PREP' },
  { id: 'database', label: 'Database', icon: 'DB' },
  { id: 'api', label: 'API', icon: 'API' },
  { id: 'ui', label: 'UI', icon: 'UI' },
  { id: 'test', label: 'Tests', icon: 'TEST' },
  { id: 'docs', label: 'Docs', icon: 'DOC' },
  { id: 'save', label: 'Save', icon: 'SAVE' },
]

export function GenerationProgress({
  progress,
  stage,
  files,
  metrics,
  reasoning,
  onCancel,
}: GenerationProgressProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const currentStageIndex = STAGES.findIndex((s) => s.id === stage.id)

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-forge-cream">
            {stage.message}
          </span>
          <span className="text-sm text-forge-beige">{Math.round(progress)}%</span>
        </div>
        <Progress
          value={progress}
          className="h-2"
        />
      </div>

      {/* Stage Indicators */}
      <div className="grid grid-cols-4 gap-3">
        {STAGES.map((s, index) => {
          const isActive = s.id === stage.id
          const isCompleted = index < currentStageIndex
          const isPending = index > currentStageIndex

          return (
            <div
              key={s.id}
              className={cn(
                'p-3 rounded border-2 transition-all',
                isActive &&
                  'border-forge-copper bg-forge-copper/10 animate-pulse',
                isCompleted &&
                  'border-forge-copper/50 bg-forge-copper/5',
                isPending && 'border-forge-taupe/30 bg-forge-charcoal/20'
              )}
            >
              <div
                className={cn(
                  'text-xs mb-1',
                  isActive && 'text-forge-copper font-medium',
                  isCompleted && 'text-forge-beige',
                  isPending && 'text-forge-taupe'
                )}
              >
                {s.label}
              </div>
              <div
                className={cn(
                  'text-lg font-mono',
                  isActive && 'text-forge-copper',
                  isCompleted && 'text-forge-beige',
                  isPending && 'text-forge-taupe'
                )}
              >
                [{s.icon}]
              </div>
              {isCompleted && (
                <CheckCircle className="w-3 h-3 text-green-500 mt-1" />
              )}
            </div>
          )
        })}
      </div>

      {/* Files Generated */}
      <div className="border border-forge-taupe rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-forge-cream flex items-center gap-2">
            <FileCode className="w-4 h-4 text-forge-copper" />
            Files Generated ({files.length})
          </h4>
        </div>

        <div className="space-y-1 max-h-48 overflow-y-auto">
          {files.length === 0 ? (
            <div className="text-sm text-forge-beige/50 text-center py-4">
              No files generated yet...
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.path}
                className="flex items-center gap-2 text-sm py-1 animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-forge-cream/70 font-mono text-xs truncate">
                  {file.path}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-3">
        <MetricCard
          icon={<FileCode className="w-4 h-4" />}
          label="Files"
          value={metrics.files.toString()}
        />
        <MetricCard
          icon={<FileCode className="w-4 h-4" />}
          label="Lines"
          value={metrics.lines.toLocaleString()}
        />
        <MetricCard
          icon={<Zap className="w-4 h-4" />}
          label="Tokens"
          value={metrics.tokens.toLocaleString()}
        />
        <MetricCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Cost"
          value={`$${metrics.cost.toFixed(2)}`}
        />
        <MetricCard
          icon={<Timer className="w-4 h-4" />}
          label="Time"
          value={`${metrics.time}s`}
        />
      </div>

      {/* AI Reasoning (collapsible) */}
      <Accordion type="single" collapsible className="border border-forge-taupe rounded-lg">
        <AccordionItem value="reasoning" className="border-none">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="text-sm font-medium text-forge-cream">
              View AI Reasoning
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2 text-sm text-forge-beige max-h-64 overflow-y-auto">
              {reasoning.length === 0 ? (
                <div className="text-forge-beige/50">
                  AI reasoning will appear here...
                </div>
              ) : (
                reasoning.map((msg, i) => (
                  <div
                    key={i}
                    className="py-1 border-l-2 border-forge-copper/30 pl-3 animate-in fade-in slide-in-from-left-2 duration-300"
                  >
                    {msg}
                  </div>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Cancel button */}
      {onCancel && (
        <>
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Generation
            </Button>
          </div>

          <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Generation?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this generation? Progress will be lost,
                  but you won't be charged for the cancelled generation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Generating</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onCancel}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Yes, Cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="border border-forge-taupe rounded-lg p-3">
      <div className="flex items-center gap-1 text-forge-copper mb-1">
        {icon}
      </div>
      <div className="text-lg font-heading text-forge-cream">{value}</div>
      <div className="text-xs text-forge-beige">{label}</div>
    </div>
  )
}

// Helper to create stage objects
export function createStage(
  id: string,
  message: string,
  progress: number
): GenerationStage {
  const stageConfig = STAGES.find((s) => s.id === id)
  if (!stageConfig) {
    throw new Error(`Invalid stage id: ${id}`)
  }

  return {
    ...stageConfig,
    message,
    progress,
  }
}
