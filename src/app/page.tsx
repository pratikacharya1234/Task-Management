'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ParticleSystem } from '@/components/ParticleSystem'
import { ForgeNavbar } from '@/components/ForgeNavbar'
import { ProjectDashboard } from '@/components/ProjectDashboard'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="relative min-h-screen bg-background blueprint-grid overflow-hidden">
      {/* Particle Effects */}
      <ParticleSystem />

      {/* Navigation */}
      <ForgeNavbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="text-center"
          >
            {/* Main Logo/Title with Industrial Aesthetic */}
            <motion.div
              className="inline-block mb-8"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-display text-shadow-ember">
                FORGE
              </h1>
              <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-accent mt-4 shadow-ember" />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-2xl md:text-3xl font-heading text-text-secondary mb-6 text-shadow-forge"
            >
              The AI Product Architect That Thinks Before It Codes
            </motion.p>

            {/* Value Proposition */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="max-w-3xl mx-auto"
            >
              <p className="text-xl text-text-primary mb-12 font-sans leading-relaxed">
                Stop building prototypes. Start shipping products.<br />
                <span className="text-secondary font-semibold">Built for founders who need real software, not demos.</span>
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
            >
              <button className="btn-forge forge-glow text-lg group">
                <span className="relative z-10 flex items-center gap-3">
                  <span className="px-2 py-1 bg-secondary text-background rounded text-sm font-bold">FIRE</span>
                  Start Building
                  <svg
                    className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              <button className="btn-forge bg-secondary hover:bg-secondary/90 text-lg">
                <span className="relative z-10 flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary text-text-primary rounded text-sm font-bold">PKG</span>
                  Import from v0/Lovable
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Project Dashboard Section */}
      <section className="relative z-10 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-hero text-center mb-12 text-shadow-forge">
              Your Project Forge
            </h2>
            <ProjectDashboard />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="divider-forge mb-20" />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-hero text-center mb-16 text-shadow-forge">
              We Don't Generate Code.<br />
              <span className="text-secondary">We Architect Products.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="relative z-10 px-4 py-20 bg-surface/20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-hero mb-6 text-shadow-forge">
              v0 builds demos.<br />
              <span className="text-accent">FORGE builds products that last.</span>
            </h2>
          </motion.div>

          <ComparisonTable />
        </div>
      </section>
    </main>
  )
}

// Feature Card Component
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="card-anvil p-8 cursor-pointer"
    >
      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
        <span className="text-xs font-bold text-text-primary">{feature.icon}</span>
      </div>
      <h3 className="font-heading text-2xl font-bold text-text-primary mb-4">
        {feature.title}
      </h3>
      <p className="text-text-secondary leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  )
}

// Comparison Table
function ComparisonTable() {
  return (
    <div className="panel-metal">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-surface-600">
              <th className="py-4 px-6 text-left font-heading text-lg text-text-secondary">Feature</th>
              <th className="py-4 px-6 text-center font-heading text-lg text-error">v0 / Lovable</th>
              <th className="py-4 px-6 text-center font-heading text-lg text-accent">FORGE</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((item, index) => (
              <motion.tr
                key={item.feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="border-b border-surface-600 hover:bg-surface-700/30 transition-colors"
              >
                <td className="py-4 px-6 font-sans font-medium text-text-primary">{item.feature}</td>
                <td className="py-4 px-6 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.others === 'NO' ? 'bg-error text-background' : 'bg-warning text-background'
                  }`}>
                    {item.others}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-success text-background">
                    {item.forge}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Types
interface Feature {
  icon: string
  title: string
  description: string
}

interface Comparison {
  feature: string
  others: string
  forge: string
}

// Data
const features: Feature[] = [
  {
    icon: 'MIND',
    title: 'Thinks Like Your Technical Co-Founder',
    description: 'Before writing code, FORGE asks: What\'s your business model? Who are your users? What\'s your compliance need? Then builds accordingly.',
  },
  {
    icon: 'TARGET',
    title: 'Production-Ready by Default',
    description: 'Every feature includes: error handling, loading states, input validation, security measures, accessibility, mobile optimization, and tests.',
  },
  {
    icon: 'CONFIG',
    title: 'Decisions, Then Code',
    description: 'Choose your auth provider, state management, database, deployment—with pros/cons for each. Code comes after decisions are locked.',
  },
  {
    icon: 'SEC',
    title: 'No Lock-In, Ever',
    description: 'Export clean, standard code anytime. No proprietary APIs. Can be maintained without FORGE.',
  },
  {
    icon: 'LEARN',
    title: 'Learn While You Build',
    description: 'AI explains every architectural decision. Hover any code to understand why it exists. Graduate from the tool.',
  },
  {
    icon: 'FIRE',
    title: 'Full-Stack Intelligence',
    description: 'Not just UI. Generate complete systems: API endpoints, database schema, authentication, authorization, and deployment.',
  },
]

const comparisons: Comparison[] = [
  { feature: 'Authentication System', others: 'NO', forge: 'YES' },
  { feature: 'Input Validation', others: 'NO', forge: 'YES' },
  { feature: 'Error Handling', others: 'NO', forge: 'YES' },
  { feature: 'Mobile Optimization', others: 'NO', forge: 'YES' },
  { feature: 'Security Measures', others: 'NO', forge: 'YES' },
  { feature: 'Performance Optimization', others: 'NO', forge: 'YES' },
  { feature: 'Database Schema', others: 'NO', forge: 'YES' },
  { feature: 'API Endpoints', others: 'NO', forge: 'YES' },
  { feature: 'Testing Coverage', others: 'NO', forge: 'YES' },
  { feature: 'Accessibility (WCAG)', others: 'NO', forge: 'YES' },
  { feature: 'Clean Code Export', others: 'PARTIAL', forge: 'YES' },
]
