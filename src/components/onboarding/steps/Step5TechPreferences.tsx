'use client'

import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

const authProviders = [
  { id: 'clerk', name: 'Clerk', icon: '🔐', recommended: true },
  { id: 'authjs', name: 'Auth.js (NextAuth)', icon: '🔑', recommended: false },
  { id: 'supabase', name: 'Supabase Auth', icon: '⚡', recommended: false },
  { id: 'firebase', name: 'Firebase Auth', icon: '🔥', recommended: false },
]

const databases = [
  { id: 'postgresql', name: 'PostgreSQL', icon: '🐘', recommended: true },
  { id: 'mysql', name: 'MySQL', icon: '🐬', recommended: false },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃', recommended: false },
  { id: 'supabase', name: 'Supabase', icon: '⚡', recommended: true },
]

const deployments = [
  { id: 'vercel', name: 'Vercel', icon: '▲', recommended: true },
  { id: 'netlify', name: 'Netlify', icon: '🌐', recommended: false },
  { id: 'railway', name: 'Railway', icon: '🚂', recommended: false },
  { id: 'fly', name: 'Fly.io', icon: '✈️', recommended: false },
]

export function Step5TechPreferences() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-8">
      <div className="panel-metal bg-info/10 border-l-4 border-info">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-heading font-bold text-info mb-2">
              These are preferences, not requirements
            </h4>
            <p className="text-sm text-text-secondary">
              You can always change these later. FORGE recommendations are based on your app type
              and production mode. Hover over options to see trade-offs.
            </p>
          </div>
        </div>
      </div>

      {/* Authentication Provider */}
      {data.requiresAuth && (
        <div>
          <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
            Authentication Provider
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {authProviders.map((provider) => (
              <motion.button
                key={provider.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateData({ preferredAuthProvider: provider.id })}
                className={`card-anvil p-4 text-center transition-all relative ${
                  data.preferredAuthProvider === provider.id
                    ? 'ring-2 ring-accent shadow-ember'
                    : ''
                }`}
              >
                {provider.recommended && (
                  <div className="absolute -top-2 -right-2 bg-success text-background text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ✓
                  </div>
                )}
                <div className="text-3xl mb-2">{provider.icon}</div>
                <h4 className="font-heading font-semibold text-sm text-text-primary">
                  {provider.name}
                </h4>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Database */}
      <div>
        <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
          Database
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {databases.map((db) => (
            <motion.button
              key={db.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateData({ preferredDatabase: db.id })}
              className={`card-anvil p-4 text-center transition-all relative ${
                data.preferredDatabase === db.id
                  ? 'ring-2 ring-accent shadow-ember'
                  : ''
              }`}
            >
              {db.recommended && (
                <div className="absolute -top-2 -right-2 bg-success text-background text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  ✓
                </div>
              )}
              <div className="text-3xl mb-2">{db.icon}</div>
              <h4 className="font-heading font-semibold text-sm text-text-primary">
                {db.name}
              </h4>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Deployment */}
      <div>
        <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
          Deployment Platform
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {deployments.map((platform) => (
            <motion.button
              key={platform.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateData({ preferredDeployment: platform.id })}
              className={`card-anvil p-4 text-center transition-all relative ${
                data.preferredDeployment === platform.id
                  ? 'ring-2 ring-accent shadow-ember'
                  : ''
              }`}
            >
              {platform.recommended && (
                <div className="absolute -top-2 -right-2 bg-success text-background text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  ✓
                </div>
              )}
              <div className="text-3xl mb-2">{platform.icon}</div>
              <h4 className="font-heading font-semibold text-sm text-text-primary">
                {platform.name}
              </h4>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel-metal bg-secondary/10 border-l-4 border-secondary"
      >
        <h4 className="font-heading text-lg font-bold text-secondary mb-4">
          🔥 Ready to Build
        </h4>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>
            <strong>App Type:</strong> {data.appType || 'Not selected'}
          </p>
          <p>
            <strong>Target Users:</strong> {data.targetUsers?.length || 0} persona(s)
          </p>
          <p>
            <strong>Production Mode:</strong> {data.productionMode || 'Not selected'}
          </p>
          {data.requiresAuth && (
            <p>
              <strong>Auth:</strong> {data.preferredAuthProvider || 'Not selected'}
            </p>
          )}
          <p>
            <strong>Database:</strong> {data.preferredDatabase || 'Not selected'}
          </p>
          <p>
            <strong>Deployment:</strong> {data.preferredDeployment || 'Not selected'}
          </p>
          {data.complianceNeeds && data.complianceNeeds.length > 0 && (
            <p>
              <strong>Compliance:</strong> {data.complianceNeeds.join(', ').toUpperCase()}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
