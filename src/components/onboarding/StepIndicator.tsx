'use client'

import { motion } from 'framer-motion'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-surface-700 -z-10" />
      <motion.div
        className="absolute top-5 left-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent shadow-ember -z-10"
        initial={{ width: '0%' }}
        animate={{
          width: `${(currentStep / (steps.length - 1)) * 100}%`,
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />

      {/* Step Circles */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isFuture = index > currentStep

          return (
            <div key={index} className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isCompleted
                    ? '#B87333'
                    : isCurrent
                    ? '#E97451'
                    : '#4A4238',
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm relative z-10 ${
                  isCompleted || isCurrent
                    ? 'shadow-ember'
                    : 'shadow-metal'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-text-primary">{index + 1}</span>
                )}
              </motion.div>
              <motion.span
                initial={false}
                animate={{
                  color: isCurrent ? '#E97451' : isCompleted ? '#B87333' : '#7A7268',
                  scale: isCurrent ? 1.05 : 1,
                }}
                className="text-xs font-heading font-semibold mt-3 text-center max-w-[120px] hidden md:block"
              >
                {step}
              </motion.span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
