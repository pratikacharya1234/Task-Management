'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboardingStore, UserPersona } from '@/lib/stores/onboardingStore'

export function Step2TargetUsers() {
  const { data, addUserPersona, removeUserPersona } = useOnboardingStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newPersona, setNewPersona] = useState<Partial<UserPersona>>({
    name: '',
    demographics: '',
    technicalAbility: 'intermediate',
    painPoints: [],
    useCases: [],
  })

  const handleAddPersona = () => {
    if (newPersona.name && newPersona.demographics) {
      addUserPersona({
        id: Math.random().toString(36).substring(7),
        name: newPersona.name,
        demographics: newPersona.demographics,
        technicalAbility: newPersona.technicalAbility as 'beginner' | 'intermediate' | 'advanced',
        painPoints: newPersona.painPoints || [],
        useCases: newPersona.useCases || [],
      })
      setNewPersona({
        name: '',
        demographics: '',
        technicalAbility: 'intermediate',
        painPoints: [],
        useCases: [],
      })
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-text-secondary leading-relaxed">
        Understanding your users helps me design the right UX, choose appropriate complexity levels,
        and ensure accessibility requirements are met.
      </p>

      {/* Existing Personas */}
      <div className="space-y-4">
        <AnimatePresence>
          {data.targetUsers.map((persona) => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-anvil p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-heading text-xl font-bold text-text-primary mb-1">
                    {persona.name}
                  </h4>
                  <p className="text-sm text-text-secondary">{persona.demographics}</p>
                </div>
                <button
                  onClick={() => removeUserPersona(persona.id)}
                  className="w-8 h-8 rounded-full bg-surface-700 hover:bg-error flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary font-semibold block mb-1">Technical Ability:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    persona.technicalAbility === 'beginner'
                      ? 'bg-warning/20 text-warning'
                      : persona.technicalAbility === 'advanced'
                      ? 'bg-success/20 text-success'
                      : 'bg-info/20 text-info'
                  }`}>
                    {persona.technicalAbility}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add New Persona */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full p-6 border-2 border-dashed border-surface-500 hover:border-secondary rounded-lg transition-colors group"
        >
          <div className="text-4xl mb-2">➕</div>
          <p className="font-heading font-semibold text-text-secondary group-hover:text-secondary transition-colors">
            Add User Persona
          </p>
        </button>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="panel-metal overflow-hidden"
          >
            <h4 className="font-heading text-lg font-bold text-text-primary mb-4">
              New User Persona
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-heading font-semibold text-text-primary mb-2">
                  Name / Title
                </label>
                <input
                  type="text"
                  value={newPersona.name}
                  onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                  placeholder="e.g., Sarah - Project Manager"
                  className="input-forge"
                />
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-text-primary mb-2">
                  Demographics & Background
                </label>
                <textarea
                  value={newPersona.demographics}
                  onChange={(e) => setNewPersona({ ...newPersona, demographics: e.target.value })}
                  placeholder="Age, role, industry, goals..."
                  rows={3}
                  className="input-forge"
                />
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-text-primary mb-2">
                  Technical Ability
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setNewPersona({ ...newPersona, technicalAbility: level })}
                      className={`p-3 rounded-lg font-heading font-semibold transition-all ${
                        newPersona.technicalAbility === level
                          ? 'bg-primary text-text-primary shadow-forge'
                          : 'bg-surface-700 text-text-secondary hover:bg-surface-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-4 py-2 bg-surface-700 hover:bg-surface-600 text-text-primary font-heading font-semibold rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPersona}
                  disabled={!newPersona.name || !newPersona.demographics}
                  className={`flex-1 btn-forge ${
                    !newPersona.name || !newPersona.demographics
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  Add Persona
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {data.targetUsers.length === 0 && !isAdding && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-text-secondary">
            Add at least one user persona to continue
          </p>
        </div>
      )}
    </div>
  )
}
