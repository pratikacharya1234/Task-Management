'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore, Decision } from '@/lib/stores/projectStore'
import { DecisionCard } from './DecisionCard'

const categories = [
  { id: 'all', name: 'All Decisions', icon: 'CONFIG' },
  { id: 'data_architecture', name: 'Data Architecture', icon: 'DATA' },
  { id: 'authentication', name: 'Authentication', icon: 'AUTH' },
  { id: 'authorization', name: 'Authorization', icon: 'TEAM' },
  { id: 'payment', name: 'Payment', icon: 'PAYMENT' },
  { id: 'state_management', name: 'State Management', icon: 'STATE' },
  { id: 'design_system', name: 'Design System', icon: 'DESIGN' },
  { id: 'deployment', name: 'Deployment', icon: 'DEPLOY' },
]

const statusFilters = [
  { id: 'all', name: 'All', icon: 'LIST' },
  { id: 'pending', name: 'Pending', icon: 'WAIT' },
  { id: 'approved', name: 'Approved', icon: 'YES' },
  { id: 'rejected', name: 'Rejected', icon: 'NO' },
]

export function DecisionFoundry() {
  const { currentProject, approveDecision, rejectDecision } = useProjectStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  if (!currentProject) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">No project selected</p>
      </div>
    )
  }

  const decisions = currentProject.decisions || []

  const filteredDecisions = decisions.filter((d) => {
    const categoryMatch = selectedCategory === 'all' || d.category === selectedCategory
    const statusMatch = selectedStatus === 'all' || d.status === selectedStatus
    return categoryMatch && statusMatch
  })

  const pendingCount = decisions.filter((d) => d.status === 'pending').length
  const approvedCount = decisions.filter((d) => d.status === 'approved').length
  const rejectedCount = decisions.filter((d) => d.status === 'rejected').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-hero mb-2 text-shadow-forge">Decision Foundry</h2>
        <p className="text-text-secondary">
          Review architectural decisions before any code is generated
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-anvil p-4">
          <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-2">
            <span className="text-xs font-bold text-text-primary">CONFIG</span>
          </div>
          <div className="font-heading text-2xl font-bold text-text-primary">
            {decisions.length}
          </div>
          <div className="text-xs text-text-secondary">Total Decisions</div>
        </div>
        <div className="card-anvil p-4">
          <div className="w-10 h-10 rounded bg-warning flex items-center justify-center mb-2">
            <span className="text-xs font-bold text-background">WAIT</span>
          </div>
          <div className="font-heading text-2xl font-bold text-warning">
            {pendingCount}
          </div>
          <div className="text-xs text-text-secondary">Pending Review</div>
        </div>
        <div className="card-anvil p-4">
          <div className="w-10 h-10 rounded bg-success flex items-center justify-center mb-2">
            <span className="text-xs font-bold text-background">YES</span>
          </div>
          <div className="font-heading text-2xl font-bold text-success">
            {approvedCount}
          </div>
          <div className="text-xs text-text-secondary">Approved</div>
        </div>
        <div className="card-anvil p-4">
          <div className="w-10 h-10 rounded bg-error flex items-center justify-center mb-2">
            <span className="text-xs font-bold text-background">NO</span>
          </div>
          <div className="font-heading text-2xl font-bold text-error">
            {rejectedCount}
          </div>
          <div className="text-xs text-text-secondary">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <h3 className="font-heading text-sm font-bold text-text-secondary mb-2">
            CATEGORY
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-heading font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-text-primary shadow-forge'
                    : 'bg-surface text-text-secondary hover:bg-surface-600'
                }`}
              >
                <span className="px-2 py-0.5 bg-surface-700 rounded text-xs font-bold">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="font-heading text-sm font-bold text-text-secondary mb-2">
            STATUS
          </h3>
          <div className="flex gap-2">
            {statusFilters.map((status) => (
              <motion.button
                key={status.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStatus(status.id)}
                className={`px-4 py-2 rounded-lg font-heading font-semibold transition-all flex items-center gap-2 ${
                  selectedStatus === status.id
                    ? 'bg-secondary text-background shadow-forge'
                    : 'bg-surface text-text-secondary hover:bg-surface-600'
                }`}
              >
                <span className="px-2 py-0.5 bg-surface-700 rounded text-xs font-bold">{status.icon}</span>
                {status.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Warning if there are pending decisions */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel-metal bg-warning/10 border-l-4 border-warning"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-warning flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-background">ALERT</span>
            </div>
            <div>
              <h4 className="font-heading font-bold text-warning mb-2">
                {pendingCount} Decision{pendingCount !== 1 ? 's' : ''} Awaiting Approval
              </h4>
              <p className="text-sm text-text-secondary">
                Code generation will begin after you approve all architectural decisions.
                Review each decision carefully - these choices affect your entire codebase.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Decision Cards */}
      {filteredDecisions.length === 0 ? (
        <div className="text-center py-20 card-anvil">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-text-primary">SEARCH</span>
          </div>
          <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
            No decisions found
          </h3>
          <p className="text-text-secondary">
            {selectedCategory === 'all' && selectedStatus === 'all'
              ? 'Complete the onboarding wizard to generate architectural decisions'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredDecisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onApprove={approveDecision}
                onReject={rejectDecision}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CTA if all approved */}
      {decisions.length > 0 && pendingCount === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="panel-metal bg-success/10 border-l-4 border-success text-center py-8"
        >
          <div className="w-16 h-16 rounded-lg bg-success flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-background">PARTY</span>
          </div>
          <h3 className="font-heading text-2xl font-bold text-success mb-4">
            All Decisions Approved!
          </h3>
          <p className="text-text-secondary mb-6">
            Your architectural blueprint is complete. Ready to generate production-ready code?
          </p>
          <button className="btn-forge px-8 py-4 text-lg">
            <span className="px-2 py-1 bg-secondary text-background rounded-md text-sm font-bold mr-2">FIRE</span>
            Start Code Generation
          </button>
        </motion.div>
      )}
    </div>
  )
}
