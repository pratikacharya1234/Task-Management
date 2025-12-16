'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Decision } from '@/lib/stores/projectStore'

interface DecisionCardProps {
  decision: Decision
  onApprove: (decisionId: string, selectedOption: string) => void
  onReject: (decisionId: string) => void
}

const categoryIcons: Record<string, string> = {
  data_architecture: '🗃️',
  authentication: '🔐',
  authorization: '👥',
  payment: '💳',
  state_management: '📊',
  design_system: '🎨',
  deployment: '📦',
}

export function DecisionCard({ decision, onApprove, onReject }: DecisionCardProps) {
  const [isExpanded, setIsExpanded] = useState(decision.status === 'pending')
  const [selectedOption, setSelectedOption] = useState(decision.selectedOption || decision.recommendedOption)

  const icon = categoryIcons[decision.category] || '⚙️'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'rejected':
        return 'error'
      default:
        return 'warning'
    }
  }

  const statusColor = getStatusColor(decision.status)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`card-anvil overflow-hidden ${
        decision.status === 'approved'
          ? 'ring-2 ring-success'
          : decision.status === 'pending'
          ? 'ring-2 ring-warning'
          : ''
      }`}
    >
      {/* Header */}
      <div
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-4xl">{icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  {decision.title}
                </h3>
                <span className={`status-${statusColor} text-xs`}>
                  {decision.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-2">{decision.description}</p>
              <p className="text-xs text-text-secondary font-mono">
                {decision.category.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6">
              {/* Recommended Option */}
              <div className="p-4 bg-success/10 border-l-4 border-success rounded">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg">✅</span>
                  <h4 className="font-heading font-bold text-success">
                    Recommended: {decision.recommendedOption}
                  </h4>
                </div>
              </div>

              {/* Alternatives */}
              {decision.alternatives && Array.isArray(decision.alternatives) && decision.alternatives.length > 0 && (
                <div>
                  <h4 className="font-heading font-bold text-text-primary mb-3">
                    ⚖️ Alternative Options
                  </h4>
                  <div className="space-y-3">
                    {decision.alternatives.map((alt: any, index: number) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02, x: 4 }}
                        onClick={() => setSelectedOption(alt.name)}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          selectedOption === alt.name
                            ? 'bg-primary/20 ring-2 ring-primary'
                            : 'bg-surface-700 hover:bg-surface-600'
                        }`}
                      >
                        <h5 className="font-heading font-bold text-text-primary mb-2">
                          {alt.name}
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-success font-semibold mb-1">Pros:</p>
                            <ul className="space-y-1">
                              {alt.pros?.map((pro: string, i: number) => (
                                <li key={i} className="text-text-secondary">• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-error font-semibold mb-1">Cons:</p>
                            <ul className="space-y-1">
                              {alt.cons?.map((con: string, i: number) => (
                                <li key={i} className="text-text-secondary">• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact Analysis */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {decision.costImplications && (
                  <div className="p-3 bg-surface-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span>💰</span>
                      <h5 className="font-heading font-bold text-sm text-text-primary">Cost</h5>
                    </div>
                    <p className="text-xs text-text-secondary">{decision.costImplications}</p>
                  </div>
                )}
                {decision.performanceImplications && (
                  <div className="p-3 bg-surface-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span>⚡</span>
                      <h5 className="font-heading font-bold text-sm text-text-primary">Performance</h5>
                    </div>
                    <p className="text-xs text-text-secondary">{decision.performanceImplications}</p>
                  </div>
                )}
                {decision.securityImplications && (
                  <div className="p-3 bg-surface-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span>🔒</span>
                      <h5 className="font-heading font-bold text-sm text-text-primary">Security</h5>
                    </div>
                    <p className="text-xs text-text-secondary">{decision.securityImplications}</p>
                  </div>
                )}
                {decision.learningCurve && (
                  <div className="p-3 bg-surface-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span>🎓</span>
                      <h5 className="font-heading font-bold text-sm text-text-primary">Learning Curve</h5>
                    </div>
                    <p className="text-xs text-text-secondary">{decision.learningCurve}</p>
                  </div>
                )}
                {decision.futureFlexibility && (
                  <div className="p-3 bg-surface-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span>🔮</span>
                      <h5 className="font-heading font-bold text-sm text-text-primary">Future Flexibility</h5>
                    </div>
                    <p className="text-xs text-text-secondary">{decision.futureFlexibility}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {decision.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-surface-600">
                  <button
                    onClick={() => onReject(decision.id)}
                    className="flex-1 px-6 py-3 bg-surface-700 hover:bg-error text-text-primary font-heading font-semibold rounded-md transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(decision.id, selectedOption)}
                    className="flex-1 btn-forge"
                  >
                    Approve: {selectedOption}
                  </button>
                </div>
              )}

              {decision.status === 'approved' && (
                <div className="p-4 bg-success/10 border-l-4 border-success rounded">
                  <p className="text-sm text-success font-semibold">
                    ✅ Approved: {decision.selectedOption}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
