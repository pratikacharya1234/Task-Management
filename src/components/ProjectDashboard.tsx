'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Project {
  id: string
  name: string
  type: string
  status: 'forging' | 'ready' | 'deployed'
  progress: number
  lastUpdated: string
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'TaskFlow SaaS',
    type: 'SaaS Platform',
    status: 'forging',
    progress: 65,
    lastUpdated: '2 hours ago',
  },
  {
    id: '2',
    name: 'HealthSync Portal',
    type: 'Healthcare App',
    status: 'ready',
    progress: 100,
    lastUpdated: '1 day ago',
  },
  {
    id: '3',
    name: 'MarketPlace Pro',
    type: 'E-commerce',
    status: 'deployed',
    progress: 100,
    lastUpdated: '3 days ago',
  },
]

export function ProjectDashboard() {
  const [projects] = useState<Project[]>(mockProjects)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon="🔨"
          label="Active Projects"
          value="3"
          change="+2 this month"
          changeType="positive"
        />
        <StatCard
          icon="⚡"
          label="Total Deployments"
          value="12"
          change="+4 this week"
          changeType="positive"
        />
        <StatCard
          icon="🎯"
          label="Completion Rate"
          value="94%"
          change="+12% vs last month"
          changeType="positive"
        />
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl font-bold text-text-primary">Your Projects</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-forge px-6 py-2 text-sm"
          >
            + New Project
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isSelected={selectedProject === project.id}
                onSelect={() => setSelectedProject(project.id)}
              />
            ))}
          </AnimatePresence>

          {/* Add Project Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: projects.length * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="card-anvil p-8 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-surface-500 hover:border-secondary cursor-pointer min-h-[280px]"
          >
            <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center text-3xl">
              ➕
            </div>
            <h4 className="font-heading text-xl font-semibold text-text-secondary">
              Start New Project
            </h4>
            <p className="text-sm text-text-secondary/70 text-center">
              Build your next product with FORGE
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  change,
  changeType,
}: {
  icon: string
  label: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card-anvil p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-ember flex items-center justify-center text-2xl">
          {icon}
        </div>
        <span className={`text-sm font-mono ${changeType === 'positive' ? 'text-success' : 'text-error'}`}>
          {change}
        </span>
      </div>
      <h4 className="font-sans text-sm text-text-secondary mb-1">{label}</h4>
      <p className="font-heading text-3xl font-bold text-text-primary">{value}</p>
    </motion.div>
  )
}

function ProjectCard({
  project,
  index,
  isSelected,
  onSelect,
}: {
  project: Project
  index: number
  isSelected: boolean
  onSelect: () => void
}) {
  const statusConfig = {
    forging: {
      label: 'Forging',
      color: 'warning',
      icon: '🔥',
      bgClass: 'bg-warning',
      textClass: 'text-background',
    },
    ready: {
      label: 'Ready',
      color: 'info',
      icon: '✨',
      bgClass: 'bg-info',
      textClass: 'text-text-primary',
    },
    deployed: {
      label: 'Deployed',
      color: 'success',
      icon: '🚀',
      bgClass: 'bg-success',
      textClass: 'text-text-primary',
    },
  }

  const status = statusConfig[project.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onClick={onSelect}
      className={`card-anvil p-6 cursor-pointer min-h-[280px] flex flex-col ${
        isSelected ? 'ring-2 ring-accent' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-heading text-xl font-bold text-text-primary mb-1">
            {project.name}
          </h4>
          <p className="text-sm text-text-secondary">{project.type}</p>
        </div>
        <span
          className={`${status.bgClass} ${status.textClass} px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}
        >
          <span>{status.icon}</span>
          {status.label}
        </span>
      </div>

      {/* Progress */}
      <div className="flex-1 flex flex-col justify-center my-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-mono text-text-secondary">Progress</span>
          <span className="text-sm font-mono font-bold text-text-primary">{project.progress}%</span>
        </div>
        <div className="progress-forge">
          <motion.div
            className="progress-forge-fill"
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-600">
        <span className="text-xs text-text-secondary">
          Updated {project.lastUpdated}
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full bg-surface-700 hover:bg-primary flex items-center justify-center transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            // Open project action
          }}
        >
          <svg className="w-4 h-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}
