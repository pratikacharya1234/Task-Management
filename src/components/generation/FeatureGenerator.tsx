'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { FeatureTypeSelector, type FeatureType, getFeatureTypeConfig } from './FeatureTypeSelector'
import { CompletenessChecker, hasBlockingIssues } from './CompletenessChecker'
import { FeatureEstimator } from './FeatureEstimator'
import { GenerationProgress, createStage, type GenerationMetrics, type GeneratedFile as ProgressFile } from './GenerationProgress'
import { CodeReviewPanel, type GeneratedFile } from './CodeReviewPanel'
import type { ProductionMode } from '@/lib/types'

interface FeatureGeneratorProps {
  projectId: string
}

interface FeatureDefinition {
  name: string
  type: FeatureType | null
  description: string
  userStories: string[]
}

type WizardStep = 1 | 2 | 3 | 4 | 5

export function FeatureGenerator({ projectId }: FeatureGeneratorProps) {
  // Wizard state
  const [step, setStep] = useState<WizardStep>(1)

  // Feature definition
  const [feature, setFeature] = useState<FeatureDefinition>({
    name: '',
    type: null,
    description: '',
    userStories: [],
  })

  // Step 2: Decision review
  const [decisionsConfirmed, setDecisionsConfirmed] = useState(false)

  // Step 4: Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState(createStage('validate', 'Preparing...', 0))
  const [generatedFiles, setGeneratedFiles] = useState<ProgressFile[]>([])
  const [metrics, setMetrics] = useState<GenerationMetrics>({
    files: 0,
    lines: 0,
    tokens: 0,
    cost: 0,
    time: 0,
  })
  const [reasoning, setReasoning] = useState<string[]>([])

  // Step 5: Review state
  const [finalFiles, setFinalFiles] = useState<GeneratedFile[]>([])

  // Mock data (replace with real data from stores)
  const project = { id: projectId, name: 'My Project' }
  const decisions: any[] = []
  const mode: ProductionMode = 'startup'

  // Step 1: Feature Definition
  const canProceedFromStep1 = feature.name.trim().length >= 3 && feature.type !== null

  const addUserStory = () => {
    setFeature((prev) => ({
      ...prev,
      userStories: [...prev.userStories, ''],
    }))
  }

  const updateUserStory = (index: number, value: string) => {
    setFeature((prev) => ({
      ...prev,
      userStories: prev.userStories.map((story, i) => (i === index ? value : story)),
    }))
  }

  const removeUserStory = (index: number) => {
    setFeature((prev) => ({
      ...prev,
      userStories: prev.userStories.filter((_, i) => i !== index),
    }))
  }

  // Step 2: Decision Review
  const canProceedFromStep2 = decisionsConfirmed

  // Step 3: Completeness Check
  const canProceedFromStep3 =
    feature.type !== null &&
    !hasBlockingIssues(project, { type: feature.type, name: feature.name, description: feature.description }, decisions)

  // Navigation
  const goToStep = (newStep: WizardStep) => {
    setStep(newStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNext = () => {
    if (step < 5) {
      goToStep((step + 1) as WizardStep)
    }
  }

  const handleBack = () => {
    if (step > 1 && step !== 4) {
      // Can't go back during generation
      goToStep((step - 1) as WizardStep)
    }
  }

  // Generation
  const handleGenerate = async () => {
    setIsGenerating(true)
    goToStep(4)

    try {
      // Simulate generation progress
      // In production, this would connect to FullStackGenerator
      await simulateGeneration()

      // Move to review step
      goToStep(5)
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Generation failed. Please try again.')
      goToStep(3)
    } finally {
      setIsGenerating(false)
    }
  }

  const simulateGeneration = async () => {
    const stages = [
      { id: 'validate', message: 'Validating prerequisites...', progress: 5, duration: 1000 },
      { id: 'context', message: 'Building context...', progress: 10, duration: 2000 },
      { id: 'database', message: 'Generating database schema...', progress: 25, duration: 3000 },
      { id: 'api', message: 'Creating API endpoints...', progress: 45, duration: 4000 },
      { id: 'ui', message: 'Building UI components...', progress: 65, duration: 5000 },
      { id: 'test', message: 'Writing tests...', progress: 80, duration: 3000 },
      { id: 'docs', message: 'Creating documentation...', progress: 90, duration: 2000 },
      { id: 'save', message: 'Saving files...', progress: 95, duration: 1000 },
    ]

    for (const stage of stages) {
      setCurrentStage(createStage(stage.id, stage.message, stage.progress))
      setProgress(stage.progress)

      // Add reasoning
      setReasoning((prev) => [...prev, stage.message])

      // Add some mock files
      if (stage.id !== 'validate' && stage.id !== 'context') {
        const mockFile: ProgressFile = {
          path: `src/${stage.id}/example-${Date.now()}.ts`,
          language: 'typescript',
          size: 1234,
        }
        setGeneratedFiles((prev) => [...prev, mockFile])

        // Update metrics
        setMetrics((prev) => ({
          files: prev.files + 1,
          lines: prev.lines + 50,
          tokens: prev.tokens + 500,
          cost: prev.cost + 0.05,
          time: prev.time + 1,
        }))
      }

      await new Promise((resolve) => setTimeout(resolve, stage.duration))
    }

    setProgress(100)

    // Set final files for review
    const mockFinalFiles: GeneratedFile[] = [
      {
        path: 'src/app/auth/login/page.tsx',
        content: '// Login page component\nexport default function LoginPage() {\n  return <div>Login</div>\n}',
        language: 'tsx',
        category: 'ui',
        explanation: 'This is the login page component with form validation.',
      },
      {
        path: 'src/server/routers/auth.ts',
        content: '// Auth router\nexport const authRouter = {}',
        language: 'typescript',
        category: 'api',
        explanation: 'API router for authentication endpoints.',
      },
    ]

    setFinalFiles(mockFinalFiles)
  }

  const handleCancelGeneration = () => {
    setIsGenerating(false)
    toast.info('Generation cancelled')
    goToStep(3)
  }

  // Apply files
  const handleApplyFiles = async (files: GeneratedFile[]) => {
    try {
      // In production, this would save files to the project
      toast.success(`${files.length} files applied successfully`)
      // Redirect to workspace or project view
    } catch (error) {
      toast.error('Failed to apply files')
    }
  }

  const handleDiscardFiles = () => {
    if (confirm('Are you sure you want to discard all generated files?')) {
      setFinalFiles([])
      goToStep(1)
      toast.info('Generation discarded')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading text-forge-cream mb-2">
          Generate Feature
        </h1>
        <p className="text-forge-beige">
          Let AI build complete, production-ready features for your project
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {([1, 2, 3, 4, 5] as WizardStep[]).map((s, index) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                  step === s && 'border-forge-copper bg-forge-copper text-forge-charcoal font-bold',
                  step > s && 'border-forge-copper bg-forge-copper/20 text-forge-copper',
                  step < s && 'border-forge-taupe text-forge-taupe'
                )}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {index < 4 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    step > s ? 'bg-forge-copper' : 'bg-forge-taupe'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-forge-beige">Define</span>
          <span className="text-xs text-forge-beige">Review</span>
          <span className="text-xs text-forge-beige">Check</span>
          <span className="text-xs text-forge-beige">Generate</span>
          <span className="text-xs text-forge-beige">Apply</span>
        </div>
      </div>

      {/* Step content */}
      <Card className="p-8">
        {/* Step 1: Feature Definition */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-heading text-forge-cream mb-4">
                Step 1: Define Your Feature
              </h2>
              <p className="text-sm text-forge-beige">
                Describe what you want to build
              </p>
            </div>

            {/* Feature name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-forge-cream">
                Feature Name *
              </label>
              <Input
                placeholder="e.g., User Authentication"
                value={feature.name}
                onChange={(e) => setFeature({ ...feature, name: e.target.value })}
                className="max-w-md"
              />
            </div>

            {/* Feature type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-forge-cream">
                Feature Type *
              </label>
              <FeatureTypeSelector
                selected={feature.type}
                onSelect={(type) => setFeature({ ...feature, type })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-forge-cream">
                Description
              </label>
              <Textarea
                placeholder="Describe your feature in detail. What should it do? What are the requirements?"
                value={feature.description}
                onChange={(e) => setFeature({ ...feature, description: e.target.value })}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* User stories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-forge-cream">
                  User Stories (Optional)
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addUserStory}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Story
                </Button>
              </div>

              {feature.userStories.length === 0 ? (
                <p className="text-sm text-forge-beige/50 italic">
                  No user stories added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {feature.userStories.map((story, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`As a user, I want to...`}
                        value={story}
                        onChange={(e) => updateUserStory(index, e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUserStory(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Decision Review */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-heading text-forge-cream mb-4">
                Step 2: Review Decisions
              </h2>
              <p className="text-sm text-forge-beige">
                Confirm your project decisions before generating
              </p>
            </div>

            {/* Show decisions or warning */}
            {decisions.length === 0 ? (
              <div className="border-2 border-yellow-500/20 bg-yellow-500/5 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-500 text-xl">⚠️</div>
                  <div>
                    <h3 className="font-medium text-yellow-500 mb-2">
                      No Decisions Made
                    </h3>
                    <p className="text-sm text-yellow-300 mb-4">
                      You haven't made any architectural decisions yet. While you can proceed,
                      making key decisions will improve code generation quality.
                    </p>
                    <Button variant="outline" size="sm">
                      Make Decisions Now
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {decisions.map((decision) => (
                  <Card key={decision.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-forge-beige mb-1">
                          {decision.category}
                        </div>
                        <div className="font-medium text-forge-cream mb-2">
                          {decision.question}
                        </div>
                        <Badge variant="secondary">{decision.selectedOption}</Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Confirmation checkbox */}
            <div className="flex items-start space-x-3 pt-4 border-t border-forge-taupe">
              <Checkbox
                id="confirm-decisions"
                checked={decisionsConfirmed}
                onCheckedChange={(checked) => setDecisionsConfirmed(checked as boolean)}
              />
              <label
                htmlFor="confirm-decisions"
                className="text-sm text-forge-cream cursor-pointer"
              >
                I confirm all decisions are correct and ready for generation
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Completeness Check */}
        {step === 3 && feature.type && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-heading text-forge-cream mb-4">
                Step 3: Pre-Generation Check
              </h2>
              <p className="text-sm text-forge-beige">
                Review what will be generated and estimated costs
              </p>
            </div>

            {/* Completeness checker */}
            <CompletenessChecker
              project={project}
              feature={{
                type: feature.type,
                name: feature.name,
                description: feature.description,
              }}
              decisions={decisions}
            />

            {/* Estimator */}
            <div className="pt-6 border-t border-forge-taupe">
              <FeatureEstimator
                feature={{
                  type: feature.type,
                  name: feature.name,
                  description: feature.description,
                  userStories: feature.userStories,
                }}
                mode={mode}
              />
            </div>
          </div>
        )}

        {/* Step 4: Generation Progress */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-heading text-forge-cream mb-4">
                Step 4: Generating Your Feature
              </h2>
              <p className="text-sm text-forge-beige">
                AI is building your feature. This may take a few minutes...
              </p>
            </div>

            <GenerationProgress
              progress={progress}
              stage={currentStage}
              files={generatedFiles}
              metrics={metrics}
              reasoning={reasoning}
              onCancel={isGenerating ? handleCancelGeneration : undefined}
            />
          </div>
        )}

        {/* Step 5: Review & Apply */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">✓</div>
                <h2 className="text-xl font-heading text-forge-cream">
                  Generation Complete!
                </h2>
              </div>
              <p className="text-sm text-forge-beige">
                Review the generated code and apply it to your project
              </p>
            </div>

            <CodeReviewPanel
              files={finalFiles}
              onApply={handleApplyFiles}
              onDiscard={handleDiscardFiles}
            />
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-forge-taupe">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || step === 4}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-sm text-forge-beige">
            Step {step} of 5
          </div>

          {step < 3 && (
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !canProceedFromStep1) ||
                (step === 2 && !canProceedFromStep2)
              }
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {step === 3 && (
            <Button
              onClick={handleGenerate}
              disabled={!canProceedFromStep3}
              className="bg-forge-copper hover:bg-forge-copper/90"
            >
              Generate Feature
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {step >= 4 && <div />}
        </div>
      </Card>
    </div>
  )
}
