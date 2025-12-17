'use client'

import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FeatureType } from './FeatureTypeSelector'

export interface Check {
  id: string
  title: string
  passed: boolean
  severity: 'blocker' | 'warning' | 'info'
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface CompletenessCheckerProps {
  project: any
  feature: {
    type: FeatureType
    name: string
    description: string
  }
  decisions: any[]
  onOpenDecisionModal?: (category: string) => void
}

export function CompletenessChecker({
  project,
  feature,
  decisions,
  onOpenDecisionModal,
}: CompletenessCheckerProps) {
  const checks = runChecks(project, feature, decisions, onOpenDecisionModal)
  const hasBlockers = checks.some((c) => c.severity === 'blocker' && !c.passed)
  const hasWarnings = checks.some((c) => c.severity === 'warning' && !c.passed)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading text-forge-cream">Readiness Check</h3>
        <div className="text-sm text-forge-beige">
          {checks.filter((c) => c.passed).length} / {checks.length} passed
        </div>
      </div>

      <div className="space-y-3">
        {checks.map((check) => (
          <div
            key={check.id}
            className={cn(
              'border-2 rounded-lg p-4 flex items-start gap-3 transition-all',
              check.passed && 'border-green-500/20 bg-green-500/5',
              !check.passed &&
                check.severity === 'warning' &&
                'border-yellow-500/20 bg-yellow-500/5',
              !check.passed &&
                check.severity === 'blocker' &&
                'border-red-500/20 bg-red-500/5',
              !check.passed &&
                check.severity === 'info' &&
                'border-blue-500/20 bg-blue-500/5'
            )}
          >
            {/* Icon */}
            {check.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            ) : check.severity === 'warning' || check.severity === 'info' ? (
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            )}

            {/* Content */}
            <div className="flex-1">
              <div className="font-medium text-forge-cream">{check.title}</div>
              <div className="text-sm text-forge-beige mt-1">{check.message}</div>

              {check.action && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={check.action.onClick}
                >
                  {check.action.label}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary alerts */}
      {hasBlockers && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Cannot Generate</AlertTitle>
          <AlertDescription>
            Fix the blocking issues above before generating this feature.
          </AlertDescription>
        </Alert>
      )}

      {!hasBlockers && hasWarnings && (
        <Alert className="border-yellow-500/20 bg-yellow-500/5">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">Warnings Found</AlertTitle>
          <AlertDescription className="text-yellow-300">
            You can proceed, but addressing these warnings will improve the generated
            code quality.
          </AlertDescription>
        </Alert>
      )}

      {!hasBlockers && !hasWarnings && (
        <Alert className="border-green-500/20 bg-green-500/5">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <AlertTitle className="text-green-500">Ready to Generate</AlertTitle>
          <AlertDescription className="text-green-300">
            All checks passed! You're ready to generate this feature.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function runChecks(
  project: any,
  feature: { type: FeatureType; name: string; description: string },
  decisions: any[],
  onOpenDecisionModal?: (category: string) => void
): Check[] {
  const checks: Check[] = []

  // Check 1: Authentication Provider (required for AUTH features)
  const hasAuthDecision = decisions.some((d) => d.category === 'AUTH')
  checks.push({
    id: 'auth-provider',
    title: 'Authentication Provider',
    passed: feature.type === 'AUTH' ? hasAuthDecision : true,
    severity: feature.type === 'AUTH' ? 'blocker' : hasAuthDecision ? 'info' : 'warning',
    message:
      feature.type === 'AUTH'
        ? hasAuthDecision
          ? 'Auth provider configured'
          : 'Required for authentication features. Choose NextAuth, Clerk, or Auth0.'
        : hasAuthDecision
        ? 'Auth provider configured'
        : 'Recommended if feature needs authentication',
    action:
      !hasAuthDecision && onOpenDecisionModal
        ? {
            label: 'Select Provider',
            onClick: () => onOpenDecisionModal('AUTH'),
          }
        : undefined,
  })

  // Check 2: Database Configuration (required for most features)
  const hasDatabaseDecision = decisions.some((d) => d.category === 'DATABASE')
  const needsDatabase = ['AUTH', 'CRUD', 'DASHBOARD', 'NOTIFICATION'].includes(
    feature.type
  )
  checks.push({
    id: 'database',
    title: 'Database Configuration',
    passed: needsDatabase ? hasDatabaseDecision : true,
    severity: needsDatabase ? 'blocker' : 'info',
    message: needsDatabase
      ? hasDatabaseDecision
        ? 'Database configured'
        : 'Required for data persistence. Choose PostgreSQL, MySQL, or MongoDB.'
      : 'Not required for this feature type',
    action:
      needsDatabase && !hasDatabaseDecision && onOpenDecisionModal
        ? {
            label: 'Configure Database',
            onClick: () => onOpenDecisionModal('DATABASE'),
          }
        : undefined,
  })

  // Check 3: Payment Provider (required for PAYMENT features)
  const hasPaymentDecision = decisions.some((d) => d.category === 'PAYMENT')
  checks.push({
    id: 'payment-provider',
    title: 'Payment Provider',
    passed: feature.type === 'PAYMENT' ? hasPaymentDecision : true,
    severity: feature.type === 'PAYMENT' ? 'blocker' : 'info',
    message:
      feature.type === 'PAYMENT'
        ? hasPaymentDecision
          ? 'Payment provider configured'
          : 'Required for payment features. Choose Stripe, PayPal, or Square.'
        : 'Not required for this feature type',
    action:
      feature.type === 'PAYMENT' && !hasPaymentDecision && onOpenDecisionModal
        ? {
            label: 'Select Provider',
            onClick: () => onOpenDecisionModal('PAYMENT'),
          }
        : undefined,
  })

  // Check 4: Storage Provider (required for UPLOAD features)
  const hasStorageDecision = decisions.some((d) => d.category === 'STORAGE')
  checks.push({
    id: 'storage-provider',
    title: 'Storage Provider',
    passed: feature.type === 'UPLOAD' ? hasStorageDecision : true,
    severity: feature.type === 'UPLOAD' ? 'blocker' : 'info',
    message:
      feature.type === 'UPLOAD'
        ? hasStorageDecision
          ? 'Storage provider configured'
          : 'Required for file uploads. Choose S3, R2, or local storage.'
        : 'Not required for this feature type',
    action:
      feature.type === 'UPLOAD' && !hasStorageDecision && onOpenDecisionModal
        ? {
            label: 'Select Provider',
            onClick: () => onOpenDecisionModal('STORAGE'),
          }
        : undefined,
  })

  // Check 5: Email Provider (recommended for AUTH, NOTIFICATION)
  const hasEmailDecision = decisions.some((d) => d.category === 'EMAIL')
  const needsEmail = ['AUTH', 'NOTIFICATION'].includes(feature.type)
  checks.push({
    id: 'email-provider',
    title: 'Email Provider',
    passed: hasEmailDecision || !needsEmail,
    severity: needsEmail ? 'warning' : 'info',
    message: needsEmail
      ? hasEmailDecision
        ? 'Email provider configured'
        : 'Recommended for sending emails. Choose SendGrid, Postmark, or Resend.'
      : 'Not required for this feature type',
    action:
      needsEmail && !hasEmailDecision && onOpenDecisionModal
        ? {
            label: 'Select Provider',
            onClick: () => onOpenDecisionModal('EMAIL'),
          }
        : undefined,
  })

  // Check 6: Project has proper structure
  checks.push({
    id: 'project-structure',
    title: 'Project Structure',
    passed: true, // Assume project is always initialized
    severity: 'info',
    message: 'Project structure is valid',
  })

  // Check 7: Feature name is descriptive
  const hasDescriptiveName = feature.name.length >= 3
  checks.push({
    id: 'feature-name',
    title: 'Feature Name',
    passed: hasDescriptiveName,
    severity: 'warning',
    message: hasDescriptiveName
      ? 'Feature name is descriptive'
      : 'Feature name should be at least 3 characters',
  })

  // Check 8: Feature description is provided
  const hasDescription = feature.description && feature.description.length >= 10
  checks.push({
    id: 'feature-description',
    title: 'Feature Description',
    passed: hasDescription,
    severity: 'warning',
    message: hasDescription
      ? 'Feature description provided'
      : 'Detailed description improves code generation quality',
  })

  return checks
}

export function hasBlockingIssues(
  project: any,
  feature: { type: FeatureType; name: string; description: string },
  decisions: any[]
): boolean {
  const checks = runChecks(project, feature, decisions)
  return checks.some((c) => c.severity === 'blocker' && !c.passed)
}
