'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { StepIndicator } from './StepIndicator'
import { Step1AppType } from './steps/Step1AppType'
import { Step2TargetUsers } from './steps/Step2TargetUsers'
import { Step3Timeline } from './steps/Step3Timeline'
import { Step4Requirements } from './steps/Step4Requirements'
import { Step5TechPreferences } from './steps/Step5TechPreferences'

export function OnboardingWizard() {
  const {
    isOpen,
    currentStep,
    totalSteps,
    setIsOpen,
    nextStep,
    previousStep,
    completeOnboarding,
  } = useOnboardingStore()

  const steps = [
    {
      title: 'What are you building?',
      component: <Step1AppType />,
    },
    {
      title: 'Who are your users?',
      component: <Step2TargetUsers />,
    },
    {
      title: "What's your timeline?",
      component: <Step3Timeline />,
    },
    {
      title: 'Any special requirements?',
      component: <Step4Requirements />,
    },
    {
      title: 'Technical preferences?',
      component: <Step5TechPreferences />,
    },
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === totalSteps - 1

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding()
      // TODO: Generate project blueprint from onboarding data
    } else {
      nextStep()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-md z-50"
          />

          {/* Wizard Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-4xl">
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
              >
                <h1 className="text-display text-4xl mb-4 text-shadow-ember">
                  Let's Build Your Product
                </h1>
                <p className="text-xl text-text-secondary">
                  I'll ask a few questions to understand your needs before writing any code
                </p>
              </motion.div>

              {/* Step Indicator */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <StepIndicator
                  steps={steps.map((s) => s.title)}
                  currentStep={currentStep}
                />
              </motion.div>

              {/* Step Content */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="panel-metal min-h-[400px] mb-6"
              >
                <h2 className="font-heading text-3xl font-bold text-text-primary mb-6">
                  {currentStepData.title}
                </h2>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStepData.component}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Navigation */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between"
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 bg-surface-700 hover:bg-surface-600 text-text-primary font-heading font-semibold rounded-md transition-colors"
                >
                  Cancel
                </button>

                <div className="flex gap-4">
                  {currentStep > 0 && (
                    <button
                      onClick={previousStep}
                      className="px-6 py-3 bg-surface-700 hover:bg-surface-600 text-text-primary font-heading font-semibold rounded-md transition-colors"
                    >
                      ← Previous
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="btn-forge px-8 py-3"
                  >
                    {isLastStep ? '🔥 Start Building' : 'Next →'}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
