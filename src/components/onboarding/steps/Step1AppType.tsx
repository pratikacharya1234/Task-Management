'use client'

import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

const appTypes = [
  {
    id: 'saas' as const,
    name: 'SaaS Platform',
    icon: '💼',
    description: 'Subscription-based software with user management, billing, and analytics',
    examples: ['Task management', 'CRM', 'Analytics dashboard'],
  },
  {
    id: 'ecommerce' as const,
    name: 'E-commerce',
    icon: '🛒',
    description: 'Online store with products, cart, checkout, and order management',
    examples: ['Fashion store', 'Electronics shop', 'Digital products'],
  },
  {
    id: 'marketplace' as const,
    name: 'Marketplace',
    icon: '🏪',
    description: 'Two-sided platform connecting buyers and sellers',
    examples: ['Freelance marketplace', 'Rental platform', 'Service marketplace'],
  },
  {
    id: 'healthcare' as const,
    name: 'Healthcare',
    icon: '🏥',
    description: 'HIPAA-compliant health application with PHI protection',
    examples: ['Telemedicine', 'Patient portal', 'Health tracking'],
  },
  {
    id: 'fintech' as const,
    name: 'Fintech',
    icon: '💰',
    description: 'Financial application with secure transactions and compliance',
    examples: ['Payment processor', 'Banking app', 'Investment platform'],
  },
  {
    id: 'social' as const,
    name: 'Social Network',
    icon: '👥',
    description: 'Community platform with user interactions and content moderation',
    examples: ['Social network', 'Forum', 'Dating app'],
  },
  {
    id: 'custom' as const,
    name: 'Custom',
    icon: '⚡',
    description: 'Something unique - tell us more!',
    examples: ['Your unique idea'],
  },
]

export function Step1AppType() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-6">
      <p className="text-text-secondary leading-relaxed">
        This helps me understand the domain and generate appropriate architecture decisions,
        security measures, and compliance requirements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appTypes.map((type, index) => (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateData({ appType: type.id })}
            className={`card-anvil p-6 text-left transition-all ${
              data.appType === type.id
                ? 'ring-2 ring-accent shadow-ember'
                : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{type.icon}</div>
              <div className="flex-1">
                <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                  {type.name}
                </h3>
                <p className="text-sm text-text-secondary mb-3">
                  {type.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {type.examples.map((example) => (
                    <span
                      key={example}
                      className="text-xs px-2 py-1 bg-surface-700 rounded-full text-text-secondary"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Custom description */}
      {data.appType && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6"
        >
          <label className="block text-sm font-heading font-semibold text-text-primary mb-2">
            Describe your app in your own words
          </label>
          <textarea
            value={data.appDescription || ''}
            onChange={(e) => updateData({ appDescription: e.target.value })}
            placeholder="What problem does this solve? What makes it unique?"
            rows={4}
            className="input-forge"
          />
        </motion.div>
      )}
    </div>
  )
}
