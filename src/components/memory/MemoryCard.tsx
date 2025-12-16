'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectMemory } from '@/lib/stores/projectStore'

interface MemoryCardProps {
  memory: ProjectMemory
  onEdit: (memory: ProjectMemory) => void
  onDelete: (id: string) => void
}

const categoryIcons: Record<string, string> = {
  blueprint: '📐',
  tech_stack: '⚙️',
  business_rules: '📋',
  compliance: '🔒',
  security: '🛡️',
  performance: '⚡',
  design_system: '🎨',
  api_contracts: '🔌',
}

const categoryColors: Record<string, string> = {
  blueprint: 'from-primary to-primary-700',
  tech_stack: 'from-secondary to-secondary-700',
  business_rules: 'from-accent to-accent-700',
  compliance: 'from-error to-error/80',
  security: 'from-success to-success/80',
  performance: 'from-warning to-warning/80',
  design_system: 'from-info to-info/80',
  api_contracts: 'from-surface-500 to-surface-700',
}

export function MemoryCard({ memory, onEdit, onDelete }: MemoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const icon = categoryIcons[memory.category] || '📝'
  const gradient = categoryColors[memory.category] || 'from-surface to-surface-700'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="card-anvil overflow-hidden group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div
        className={`h-2 bg-gradient-to-r ${gradient}`}
      />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-3xl">{icon}</div>
            <div className="flex-1">
              <h4 className="font-heading text-lg font-bold text-text-primary mb-1">
                {memory.title}
              </h4>
              <p className="text-xs text-text-secondary font-mono">
                {memory.category.replace('_', ' ').toUpperCase()} · v{memory.version}
              </p>
            </div>
          </div>

          {/* Actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex gap-2"
              >
                <button
                  onClick={() => onEdit(memory)}
                  className="w-8 h-8 rounded-full bg-surface-700 hover:bg-primary flex items-center justify-center transition-colors"
                  title="Edit memory"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this memory? This action cannot be undone.')) {
                      onDelete(memory.id)
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-surface-700 hover:bg-error flex items-center justify-center transition-colors"
                  title="Delete memory"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          <div className={`text-sm text-text-secondary ${isExpanded ? '' : 'line-clamp-2'}`}>
            {typeof memory.content === 'string'
              ? memory.content
              : JSON.stringify(memory.content, null, 2)}
          </div>
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs text-secondary hover:text-secondary/80 font-semibold mt-2"
            >
              Show more →
            </button>
          )}
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
              {/* Reasoning */}
              {memory.reasoning && (
                <div className="mb-4 p-4 bg-surface-700 rounded-md border-l-4 border-warning">
                  <h5 className="text-xs font-mono font-bold text-warning mb-2">
                    💡 WHY THIS WAS DECIDED:
                  </h5>
                  <p className="text-sm text-text-secondary">{memory.reasoning}</p>
                </div>
              )}

              {/* Full Content */}
              <div className="p-4 bg-background rounded-md font-mono text-xs overflow-x-auto">
                <pre className="text-text-secondary whitespace-pre-wrap">
                  {JSON.stringify(memory.content, null, 2)}
                </pre>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-secondary hover:text-secondary/80 font-semibold mt-4"
              >
                Show less ↑
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-600 mt-4">
          <span className="text-xs text-text-secondary">
            Updated {new Date(memory.updatedAt).toLocaleDateString()}
          </span>
          <span className="text-xs font-mono text-text-secondary/70">
            ID: {memory.id.slice(0, 8)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
