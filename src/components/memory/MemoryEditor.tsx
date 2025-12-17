'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore, ProjectMemory } from '@/lib/stores/projectStore'

interface MemoryEditorProps {
  isOpen: boolean
  onClose: () => void
  memory?: ProjectMemory | null
}

const categories = [
  { id: 'blueprint', name: 'Blueprint', icon: 'BLPR' },
  { id: 'tech_stack', name: 'Tech Stack', icon: 'TECH' },
  { id: 'business_rules', name: 'Business Rules', icon: 'BIZR' },
  { id: 'compliance', name: 'Compliance', icon: 'CMPL' },
  { id: 'security', name: 'Security', icon: 'SECR' },
  { id: 'performance', name: 'Performance', icon: 'PERF' },
  { id: 'design_system', name: 'Design System', icon: 'DSGN' },
  { id: 'api_contracts', name: 'API Contracts', icon: 'API' },
]

export function MemoryEditor({ isOpen, onClose, memory }: MemoryEditorProps) {
  const { addMemory, updateMemory } = useProjectStore()

  const [category, setCategory] = useState(memory?.category || 'blueprint')
  const [key, setKey] = useState(memory?.key || '')
  const [title, setTitle] = useState(memory?.title || '')
  const [content, setContent] = useState(
    memory?.content ? JSON.stringify(memory.content, null, 2) : ''
  )
  const [reasoning, setReasoning] = useState(memory?.reasoning || '')

  useEffect(() => {
    if (memory) {
      setCategory(memory.category)
      setKey(memory.key)
      setTitle(memory.title)
      setContent(JSON.stringify(memory.content, null, 2))
      setReasoning(memory.reasoning || '')
    } else {
      setCategory('blueprint')
      setKey('')
      setTitle('')
      setContent('')
      setReasoning('')
    }
  }, [memory, isOpen])

  const handleSave = () => {
    let parsedContent: any
    try {
      parsedContent = JSON.parse(content)
    } catch (e) {
      parsedContent = content
    }

    if (memory) {
      // Update existing memory
      updateMemory(memory.id, {
        category,
        key,
        title,
        content: parsedContent,
        reasoning,
        version: memory.version + 1,
      })
    } else {
      // Create new memory
      const newMemory: ProjectMemory = {
        id: Math.random().toString(36).substring(7),
        category,
        key,
        title,
        content: parsedContent,
        reasoning,
        version: 1,
        updatedAt: new Date(),
      }
      addMemory(newMemory)
    }

    onClose()
  }

  const isValid = category && key && title && content

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="panel-metal max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-600">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-text-primary">
                    {memory ? 'Edit Memory' : 'New Memory'}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Persistent context that FORGE will remember forever
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-surface-700 hover:bg-error flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-heading font-semibold text-text-primary mb-3">
                    Category
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-lg font-heading font-semibold transition-all ${
                          category === cat.id
                            ? 'bg-primary text-text-primary shadow-forge'
                            : 'bg-surface-700 text-text-secondary hover:bg-surface-600'
                        }`}
                      >
                        <div className="text-sm mb-1 font-bold">{cat.icon}</div>
                        <div className="text-xs">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key */}
                <div>
                  <label htmlFor="key" className="block text-sm font-heading font-semibold text-text-primary mb-2">
                    Unique Key
                  </label>
                  <input
                    id="key"
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="e.g., auth_provider, payment_gateway"
                    className="input-forge"
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    A unique identifier for this memory within its category
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-heading font-semibold text-text-primary mb-2">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Authentication Provider Selection"
                    className="input-forge"
                  />
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-heading font-semibold text-text-primary mb-2">
                    Content (JSON or Text)
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder='{"provider": "Clerk", "features": ["MFA", "Social Login"]}'
                    rows={8}
                    className="input-forge font-mono text-sm"
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    Enter JSON object or plain text. JSON will be parsed automatically.
                  </p>
                </div>

                {/* Reasoning */}
                <div>
                  <label htmlFor="reasoning" className="block text-sm font-heading font-semibold text-text-primary mb-2">
                    Why This Was Decided? (Optional)
                  </label>
                  <textarea
                    id="reasoning"
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="Explain the reasoning behind this decision..."
                    rows={4}
                    className="input-forge"
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    Document the reasoning to prevent future confusion
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-surface-600">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-surface-700 hover:bg-surface-600 text-text-primary font-heading font-semibold rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isValid}
                  className={`flex-1 btn-forge ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {memory ? 'Update Memory' : 'Create Memory'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
