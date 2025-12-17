'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore, ProjectMemory } from '@/lib/stores/projectStore'
import { MemoryCard } from './MemoryCard'
import { MemoryEditor } from './MemoryEditor'

const categories = [
  { id: 'all', name: 'All Memories', icon: 'ALL' },
  { id: 'blueprint', name: 'Blueprint', icon: 'BLPR' },
  { id: 'tech_stack', name: 'Tech Stack', icon: 'TECH' },
  { id: 'business_rules', name: 'Business Rules', icon: 'BIZR' },
  { id: 'compliance', name: 'Compliance', icon: 'CMPL' },
  { id: 'security', name: 'Security', icon: 'SECR' },
  { id: 'performance', name: 'Performance', icon: 'PERF' },
  { id: 'design_system', name: 'Design System', icon: 'DSGN' },
  { id: 'api_contracts', name: 'API Contracts', icon: 'API' },
]

export function MemoryDashboard() {
  const { currentProject, deleteMemory } = useProjectStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<ProjectMemory | null>(null)

  if (!currentProject) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">No project selected</p>
      </div>
    )
  }

  const memories = currentProject.memories || []
  const filteredMemories =
    selectedCategory === 'all'
      ? memories
      : memories.filter((m) => m.category === selectedCategory)

  const handleEdit = (memory: ProjectMemory) => {
    setEditingMemory(memory)
    setIsEditorOpen(true)
  }

  const handleNew = () => {
    setEditingMemory(null)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingMemory(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-hero mb-2 text-shadow-forge">Project DNA</h2>
          <p className="text-text-secondary">
            Persistent context that FORGE never forgets
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNew}
          className="btn-forge px-6 py-3"
        >
          + New Memory
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-anvil p-4">
          <div className="w-10 h-10 mb-2 flex items-center justify-center bg-gradient-to-br from-primary to-secondary rounded-lg">
            <span className="text-xs font-bold text-text-primary">ALL</span>
          </div>
          <div className="font-heading text-2xl font-bold text-text-primary">
            {memories.length}
          </div>
          <div className="text-xs text-text-secondary">Total Memories</div>
        </div>
        <div className="card-anvil p-4">
          <div className="w-10 h-10 mb-2 flex items-center justify-center bg-gradient-to-br from-primary to-secondary rounded-lg">
            <span className="text-xs font-bold text-text-primary">BLPR</span>
          </div>
          <div className="font-heading text-2xl font-bold text-text-primary">
            {memories.filter((m) => m.category === 'blueprint').length}
          </div>
          <div className="text-xs text-text-secondary">Blueprint Items</div>
        </div>
        <div className="card-anvil p-4">
          <div className="w-10 h-10 mb-2 flex items-center justify-center bg-gradient-to-br from-primary to-secondary rounded-lg">
            <span className="text-xs font-bold text-text-primary">TECH</span>
          </div>
          <div className="font-heading text-2xl font-bold text-text-primary">
            {memories.filter((m) => m.category === 'tech_stack').length}
          </div>
          <div className="text-xs text-text-secondary">Tech Decisions</div>
        </div>
        <div className="card-anvil p-4">
          <div className="w-10 h-10 mb-2 flex items-center justify-center bg-gradient-to-br from-primary to-secondary rounded-lg">
            <span className="text-xs font-bold text-text-primary">SECR</span>
          </div>
          <div className="font-heading text-2xl font-bold text-text-primary">
            {memories.filter((m) => m.category === 'compliance' || m.category === 'security').length}
          </div>
          <div className="text-xs text-text-secondary">Security/Compliance</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-heading font-semibold whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? 'bg-primary text-text-primary shadow-forge'
                : 'bg-surface text-text-secondary hover:bg-surface-600'
            }`}
          >
            <span className="mr-2 text-xs font-bold">{category.icon}</span>
            {category.name}
          </motion.button>
        ))}
      </div>

      {/* Memory Grid */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-20 card-anvil">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
            No memories found
          </h3>
          <p className="text-text-secondary mb-6">
            {selectedCategory === 'all'
              ? 'Start adding memories to build your project context'
              : `No memories in ${categories.find((c) => c.id === selectedCategory)?.name} category`}
          </p>
          <button onClick={handleNew} className="btn-forge px-6 py-3">
            + Add First Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMemories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onEdit={handleEdit}
                onDelete={deleteMemory}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Memory Editor Modal */}
      <MemoryEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        memory={editingMemory}
      />
    </div>
  )
}
