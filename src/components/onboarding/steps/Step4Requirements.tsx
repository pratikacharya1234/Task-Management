'use client'

import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

const requirements = [
  {
    id: 'auth',
    key: 'requiresAuth',
    name: 'Authentication',
    icon: '🔐',
    description: 'User login, registration, and session management',
  },
  {
    id: 'payments',
    key: 'requiresPayments',
    name: 'Payments',
    icon: '💳',
    description: 'Accept payments, subscriptions, or process transactions',
  },
  {
    id: 'realtime',
    key: 'requiresRealtime',
    name: 'Real-time Features',
    icon: '⚡',
    description: 'Live updates, chat, notifications, or collaborative editing',
  },
]

const complianceOptions = [
  { id: 'hipaa', name: 'HIPAA', icon: '🏥', description: 'Health data protection' },
  { id: 'gdpr', name: 'GDPR', icon: '🇪🇺', description: 'EU data privacy' },
  { id: 'soc2', name: 'SOC 2', icon: '🔒', description: 'Security & availability' },
  { id: 'pci-dss', name: 'PCI-DSS', icon: '💳', description: 'Payment card security' },
  { id: 'coppa', name: 'COPPA', icon: '👶', description: 'Children\'s privacy' },
]

export function Step4Requirements() {
  const { data, updateData } = useOnboardingStore()

  const toggleCompliance = (id: string) => {
    const current = data.complianceNeeds || []
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id]
    updateData({ complianceNeeds: updated })
  }

  return (
    <div className="space-y-8">
      <p className="text-text-secondary leading-relaxed">
        These requirements affect architecture decisions, security measures, and code generation.
        Be thorough - it's easier to add now than retrofit later.
      </p>

      {/* Core Requirements */}
      <div>
        <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
          Core Features
        </h3>
        <div className="space-y-3">
          {requirements.map((req, index) => (
            <motion.button
              key={req.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
              onClick={() =>
                updateData({
                  [req.key]: !(data as any)[req.key],
                } as any)
              }
              className={`w-full card-anvil p-4 text-left transition-all flex items-center gap-4 ${
                (data as any)[req.key]
                  ? 'ring-2 ring-success shadow-[0_0_12px_rgba(45,80,22,0.6)]'
                  : ''
              }`}
            >
              <div className="text-4xl">{req.icon}</div>
              <div className="flex-1">
                <h4 className="font-heading text-lg font-bold text-text-primary mb-1">
                  {req.name}
                </h4>
                <p className="text-sm text-text-secondary">{req.description}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  (data as any)[req.key]
                    ? 'bg-success border-success'
                    : 'border-surface-500'
                }`}
              >
                {(data as any)[req.key] && (
                  <svg className="w-4 h-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Compliance Requirements */}
      <div>
        <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
          Compliance Requirements
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Select all that apply. This will affect data handling, security measures, and documentation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {complianceOptions.map((option, index) => {
            const isSelected = data.complianceNeeds?.includes(option.id)

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCompliance(option.id)}
                className={`card-anvil p-4 text-left transition-all ${
                  isSelected
                    ? 'ring-2 ring-warning shadow-[0_0_12px_rgba(255,191,0,0.4)]'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{option.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-heading text-lg font-bold text-text-primary mb-1">
                      {option.name}
                    </h4>
                    <p className="text-xs text-text-secondary">{option.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-warning border-warning'
                        : 'border-surface-500'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Warning if compliance is selected */}
      {data.complianceNeeds && data.complianceNeeds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel-metal bg-warning/10 border-l-4 border-warning"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h4 className="font-heading font-bold text-warning mb-2">
                Compliance Requirements Detected
              </h4>
              <p className="text-sm text-text-secondary">
                FORGE will generate additional security measures, audit trails, data handling procedures,
                and compliance documentation for: <strong>{data.complianceNeeds.join(', ').toUpperCase()}</strong>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
