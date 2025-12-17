'use client'

import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

const timelines = [
  {
    id: '1-week' as const,
    name: 'MVP in 1 Week',
    mode: 'mvp' as const,
    icon: 'MVP',
    description: 'Fast iteration, minimal features, technical debt acceptable',
    features: ['Core functionality only', 'Basic validation', 'Simple auth', 'Quick deployment'],
    tradeoffs: ['Limited features', 'Technical debt', 'Minimal testing'],
  },
  {
    id: '1-month' as const,
    name: 'Full Product in 1 Month',
    mode: 'startup' as const,
    icon: 'PRO',
    description: 'Balanced approach with production-ready code',
    features: ['Full feature set', 'Robust validation', 'Complete auth', 'Error tracking', 'Analytics'],
    tradeoffs: ['Takes more time', 'More complex'],
  },
  {
    id: '3-months' as const,
    name: 'Enterprise-Ready in 3 Months',
    mode: 'enterprise' as const,
    icon: 'ENT',
    description: 'Bulletproof, scalable, compliance-ready',
    features: ['Comprehensive features', 'Full test coverage', 'SSO/SAML', 'Audit trails', 'Multi-region', 'Feature flags'],
    tradeoffs: ['Longest timeline', 'Most complex', 'Higher cost'],
  },
]

export function Step3Timeline() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-6">
      <p className="text-text-secondary leading-relaxed">
        Your timeline determines the production mode and complexity level. This affects code patterns,
        libraries, testing requirements, and security measures.
      </p>

      <div className="space-y-4">
        {timelines.map((timeline, index) => (
          <motion.button
            key={timeline.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              updateData({
                timeline: timeline.id,
                productionMode: timeline.mode,
              })
            }
            className={`w-full card-anvil p-6 text-left transition-all ${
              data.timeline === timeline.id
                ? 'ring-2 ring-accent shadow-ember'
                : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary to-secondary rounded-lg">
                <span className="text-xs font-bold text-text-primary">{timeline.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-2xl font-bold text-text-primary mb-2">
                  {timeline.name}
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  {timeline.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-xs font-heading font-bold text-success mb-2">
                    INCLUDES:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {timeline.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-2 py-1 bg-success/20 text-success rounded-full font-semibold"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tradeoffs */}
                <div>
                  <h4 className="text-xs font-heading font-bold text-warning mb-2">
                    TRADEOFFS:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {timeline.tradeoffs.map((tradeoff) => (
                      <span
                        key={tradeoff}
                        className="text-xs px-2 py-1 bg-warning/20 text-warning rounded-full font-semibold"
                      >
                        {tradeoff}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {data.timeline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel-metal"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-info/20 rounded">
              <span className="text-sm font-bold text-info">!</span>
            </div>
            <div>
              <h4 className="font-heading font-bold text-text-primary mb-2">
                Production Mode: {data.productionMode?.toUpperCase()}
              </h4>
              <p className="text-sm text-text-secondary">
                All code generated will follow {data.productionMode} mode standards. You can always
                upgrade to a higher mode later without rewriting everything.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
