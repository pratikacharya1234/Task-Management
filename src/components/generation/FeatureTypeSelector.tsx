'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type FeatureType =
  | 'AUTH'
  | 'CRUD'
  | 'DASHBOARD'
  | 'PAYMENT'
  | 'API'
  | 'UPLOAD'
  | 'SEARCH'
  | 'NOTIFICATION'
  | 'CUSTOM'

export interface FeatureTypeConfig {
  type: FeatureType
  icon: string
  name: string
  description: string
  includes: string[]
  estimatedTime: string
  complexity: 'Low' | 'Medium' | 'High'
  filesCount: number
}

export const FEATURE_TYPES: FeatureTypeConfig[] = [
  {
    type: 'AUTH',
    icon: 'LOCK',
    name: 'Authentication',
    description: 'Complete auth system with login, signup, password reset, MFA',
    includes: [
      'Login/signup pages',
      'Session management',
      'Password reset flow',
      'Email verification',
      'MFA support (optional)',
    ],
    estimatedTime: '5-10 min',
    complexity: 'Medium',
    filesCount: 15,
  },
  {
    type: 'CRUD',
    icon: 'DB',
    name: 'CRUD Operations',
    description: 'Complete CRUD with list, create, edit, delete, pagination',
    includes: [
      'List view with search',
      'Create/edit forms',
      'Delete confirmation',
      'Pagination',
      'Validation',
    ],
    estimatedTime: '3-5 min',
    complexity: 'Low',
    filesCount: 10,
  },
  {
    type: 'DASHBOARD',
    icon: 'DASH',
    name: 'Dashboard',
    description: 'Analytics dashboard with charts, metrics, and real-time data',
    includes: [
      'Metric cards',
      'Charts & graphs',
      'Real-time updates',
      'Filters & date ranges',
      'Export functionality',
    ],
    estimatedTime: '7-12 min',
    complexity: 'High',
    filesCount: 20,
  },
  {
    type: 'PAYMENT',
    icon: 'PAY',
    name: 'Payments',
    description: 'Stripe integration with checkout, subscriptions, and webhooks',
    includes: [
      'Checkout flow',
      'Subscription management',
      'Payment history',
      'Webhook handlers',
      'Invoice generation',
    ],
    estimatedTime: '8-15 min',
    complexity: 'High',
    filesCount: 18,
  },
  {
    type: 'API',
    icon: 'API',
    name: 'API Integration',
    description: 'External API integration with error handling and caching',
    includes: [
      'API client setup',
      'Type-safe endpoints',
      'Error handling',
      'Response caching',
      'Rate limiting',
    ],
    estimatedTime: '4-8 min',
    complexity: 'Medium',
    filesCount: 12,
  },
  {
    type: 'UPLOAD',
    icon: 'UP',
    name: 'File Upload',
    description: 'File upload with drag-drop, preview, and cloud storage',
    includes: [
      'Drag & drop UI',
      'File validation',
      'Progress tracking',
      'Cloud storage (S3/R2)',
      'Image optimization',
    ],
    estimatedTime: '5-10 min',
    complexity: 'Medium',
    filesCount: 14,
  },
  {
    type: 'SEARCH',
    icon: 'SRCH',
    name: 'Search',
    description: 'Full-text search with filters, facets, and autocomplete',
    includes: [
      'Search interface',
      'Autocomplete',
      'Filters & facets',
      'Search indexing',
      'Relevance ranking',
    ],
    estimatedTime: '6-12 min',
    complexity: 'High',
    filesCount: 16,
  },
  {
    type: 'NOTIFICATION',
    icon: 'NOTIF',
    name: 'Notifications',
    description: 'Multi-channel notifications (email, push, in-app)',
    includes: [
      'Notification center',
      'Email templates',
      'Push notifications',
      'Preferences',
      'Real-time delivery',
    ],
    estimatedTime: '7-14 min',
    complexity: 'High',
    filesCount: 17,
  },
  {
    type: 'CUSTOM',
    icon: 'CUST',
    name: 'Custom Feature',
    description: 'Describe your own feature and let AI build it',
    includes: [
      'AI analyzes requirements',
      'Suggests architecture',
      'Generates custom code',
      'Adapts to your stack',
      'Learns from your patterns',
    ],
    estimatedTime: 'Varies',
    complexity: 'Medium',
    filesCount: 0, // varies
  },
]

interface FeatureTypeSelectorProps {
  selected: FeatureType | null
  onSelect: (type: FeatureType) => void
}

export function FeatureTypeSelector({ selected, onSelect }: FeatureTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {FEATURE_TYPES.map((type) => (
        <button
          key={type.type}
          onClick={() => onSelect(type.type)}
          className={cn(
            'border-2 rounded-lg p-6 text-left transition-all',
            'hover:border-forge-copper hover:shadow-lg',
            'focus:outline-none focus:ring-2 focus:ring-forge-copper focus:ring-offset-2',
            selected === type.type &&
              'border-forge-copper bg-forge-copper/10 shadow-lg'
          )}
        >
          {/* Icon & Name */}
          <div className="flex items-start justify-between mb-3">
            <div className="text-2xl font-mono text-forge-copper">
              [{type.icon}]
            </div>
            {selected === type.type && (
              <div className="text-forge-copper text-sm font-medium">
                Selected ✓
              </div>
            )}
          </div>

          <h3 className="font-heading text-lg mb-2 text-forge-cream">
            {type.name}
          </h3>

          <p className="text-sm text-forge-beige mb-4 leading-relaxed">
            {type.description}
          </p>

          {/* Includes */}
          <div className="space-y-1 mb-4">
            {type.includes.map((item) => (
              <div
                key={item}
                className="text-xs text-forge-cream/70 flex items-start"
              >
                <span className="text-forge-copper mr-2">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            {type.filesCount > 0 && (
              <Badge variant="secondary" className="bg-forge-taupe/30">
                ~{type.filesCount} files
              </Badge>
            )}
            <Badge variant="outline" className="border-forge-taupe">
              {type.estimatedTime}
            </Badge>
            <Badge
              variant={type.complexity === 'Low' ? 'default' : 'secondary'}
              className={cn(
                type.complexity === 'Low' && 'bg-green-500/20 text-green-300',
                type.complexity === 'Medium' &&
                  'bg-yellow-500/20 text-yellow-300',
                type.complexity === 'High' && 'bg-red-500/20 text-red-300'
              )}
            >
              {type.complexity}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  )
}

export function getFeatureTypeConfig(type: FeatureType): FeatureTypeConfig | undefined {
  return FEATURE_TYPES.find((t) => t.type === type)
}
