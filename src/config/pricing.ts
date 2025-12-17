/**
 * FORGE Pricing Configuration
 *
 * Defines all pricing plans, limits, and monetization strategies.
 */

export type PlanId = 'free' | 'builder' | 'master' | 'enterprise'

export interface PricingPlan {
  id: PlanId
  name: string
  tagline: string
  price: {
    monthly: number
    yearly: number | null
  }
  stripeIds?: {
    monthly: string
    yearly: string
  }
  limits: {
    projects: number // -1 = unlimited
    generations: number // per month, -1 = unlimited
    filesPerGeneration: number // -1 = unlimited
    teamMembers: number // -1 = unlimited
    imports: number // per month, -1 = unlimited
  }
  features: string[]
  restrictions: string[]
  cta: string
  popular: boolean
  trialDays?: number
  custom?: boolean
  additionalSeats?: {
    price: number
    stripeId: string
  }
}

export const PRICING_PLANS: Record<PlanId, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Apprentice',
    tagline: 'Perfect for exploring FORGE',
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      projects: 3,
      generations: 50, // per month
      filesPerGeneration: 10,
      teamMembers: 1,
      imports: 0,
    },
    features: [
      'Up to 3 projects',
      '50 AI generations/month',
      'MVP mode only',
      'Community support',
      'Basic code export',
      'FORGE branding on exports',
    ],
    restrictions: [
      'No team collaboration',
      'No Startup/Enterprise modes',
      'No import from competitors',
      'Community support only',
    ],
    cta: 'Start Free',
    popular: false,
  },

  builder: {
    id: 'builder',
    name: 'Builder',
    tagline: 'For indie hackers & solopreneurs',
    price: {
      monthly: 49,
      yearly: 470, // ~20% discount
    },
    stripeIds: {
      monthly: 'price_builder_monthly_xxx',
      yearly: 'price_builder_yearly_xxx',
    },
    limits: {
      projects: -1, // unlimited
      generations: 500,
      filesPerGeneration: -1, // unlimited
      teamMembers: 1,
      imports: 5, // per month
    },
    features: [
      'Unlimited projects',
      '500 AI generations/month',
      'All modes (MVP, Startup, Enterprise)',
      'Email support (24h response)',
      'Remove FORGE branding',
      'Import from v0/Lovable/Bolt (5/month)',
      'Priority generation queue',
      'Full code export',
      'Time-travel debugging',
      'Security audit reports',
    ],
    restrictions: [
      'No team collaboration',
      'Limited imports (5/month)',
    ],
    cta: 'Start 14-Day Trial',
    popular: true,
    trialDays: 14,
  },

  master: {
    id: 'master',
    name: 'Master',
    tagline: 'For teams & agencies',
    price: {
      monthly: 149,
      yearly: 1430, // ~20% discount
    },
    stripeIds: {
      monthly: 'price_master_monthly_xxx',
      yearly: 'price_master_yearly_xxx',
    },
    limits: {
      projects: -1,
      generations: -1, // unlimited
      filesPerGeneration: -1,
      teamMembers: 5, // included
      imports: -1, // unlimited
    },
    additionalSeats: {
      price: 25, // per seat/month
      stripeId: 'price_master_seat_xxx',
    },
    features: [
      'Everything in Builder',
      'Unlimited AI generations',
      'Team collaboration (5 seats)',
      'Priority support (2h response)',
      'Advanced analytics',
      'Custom design systems',
      'Unlimited imports',
      'API access (CI/CD)',
      'White-label exports',
      'SOC2 compliance docs',
      'Dedicated Slack channel',
      'Monthly strategy calls',
    ],
    restrictions: [],
    cta: 'Start 7-Day Trial',
    popular: false,
    trialDays: 7,
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For large teams & compliance needs',
    price: {
      monthly: 999, // starting price
      yearly: null, // custom
    },
    custom: true,
    limits: {
      projects: -1,
      generations: -1,
      filesPerGeneration: -1,
      teamMembers: -1, // unlimited
      imports: -1,
    },
    features: [
      'Everything in Master',
      'Unlimited seats',
      'On-premise deployment option',
      'Custom AI training',
      '99.9% SLA guarantee',
      'HIPAA, SOC2, GDPR compliance',
      'Technical account manager',
      'Custom integrations',
      'Dedicated infrastructure',
      'Volume discounts',
      'Annual contract terms',
    ],
    restrictions: [],
    cta: 'Contact Sales',
    popular: false,
  },
}

export interface AddOn {
  id: string
  name: string
  price: number
  stripeId: string
  quantity?: number
  perUse?: boolean
}

export const ADD_ONS = {
  GENERATIONS_100: {
    id: 'addon_gen_100',
    name: '100 Extra Generations',
    price: 9.99,
    stripeId: 'price_addon_gen_100_xxx',
    quantity: 100,
  },
  GENERATIONS_500: {
    id: 'addon_gen_500',
    name: '500 Extra Generations',
    price: 39.99,
    stripeId: 'price_addon_gen_500_xxx',
    quantity: 500,
  },
  GENERATIONS_1000: {
    id: 'addon_gen_1000',
    name: '1,000 Extra Generations',
    price: 69.99,
    stripeId: 'price_addon_gen_1000_xxx',
    quantity: 1000,
  },
  RUSH_GENERATION: {
    id: 'addon_rush',
    name: 'Rush Generation (10x faster)',
    price: 4.99,
    stripeId: 'price_addon_rush_xxx',
    perUse: true,
  },
} as const

// Usage tracking interface
export interface UserUsage {
  generationsThisMonth: number
  projectsCount: number
  importsThisMonth: number
  lastResetDate: Date
}

// Helper functions
export function canUserGenerate(planId: PlanId, usage: UserUsage): boolean {
  const plan = PRICING_PLANS[planId]

  // Check generation limit
  if (plan.limits.generations !== -1) {
    if (usage.generationsThisMonth >= plan.limits.generations) {
      return false
    }
  }

  return true
}

export function canUserCreateProject(planId: PlanId, usage: UserUsage): boolean {
  const plan = PRICING_PLANS[planId]

  // Check project limit
  if (plan.limits.projects !== -1) {
    if (usage.projectsCount >= plan.limits.projects) {
      return false
    }
  }

  return true
}

export function getUpgradeReason(planId: PlanId, usage: UserUsage): string | null {
  const plan = PRICING_PLANS[planId]

  if (plan.limits.generations !== -1 && usage.generationsThisMonth >= plan.limits.generations) {
    return 'You\'ve reached your monthly generation limit. Upgrade to continue.'
  }

  if (plan.limits.projects !== -1 && usage.projectsCount >= plan.limits.projects) {
    return 'You\'ve reached your project limit. Upgrade for unlimited projects.'
  }

  return null
}

export function shouldShowUpgradePrompt(planId: PlanId, usage: UserUsage): boolean {
  const plan = PRICING_PLANS[planId]

  // Show at 80% of limit
  if (plan.limits.generations !== -1) {
    const threshold = plan.limits.generations * 0.8
    if (usage.generationsThisMonth >= threshold) {
      return true
    }
  }

  // Show at 80% of project limit
  if (plan.limits.projects !== -1) {
    const threshold = plan.limits.projects * 0.8
    if (usage.projectsCount >= threshold) {
      return true
    }
  }

  return false
}

export function getRemainingGenerations(planId: PlanId, usage: UserUsage): number | null {
  const plan = PRICING_PLANS[planId]

  if (plan.limits.generations === -1) {
    return null // unlimited
  }

  return Math.max(0, plan.limits.generations - usage.generationsThisMonth)
}

export function getUsagePercentage(planId: PlanId, usage: UserUsage): number {
  const plan = PRICING_PLANS[planId]

  if (plan.limits.generations === -1) {
    return 0 // unlimited
  }

  return (usage.generationsThisMonth / plan.limits.generations) * 100
}

export function getNextPlan(currentPlanId: PlanId): PlanId | null {
  const planOrder: PlanId[] = ['free', 'builder', 'master', 'enterprise']
  const currentIndex = planOrder.indexOf(currentPlanId)

  if (currentIndex === -1 || currentIndex === planOrder.length - 1) {
    return null
  }

  return planOrder[currentIndex + 1]
}

export function getPlanComparison(fromPlanId: PlanId, toPlanId: PlanId): {
  generationsIncrease: number | 'unlimited'
  projectsIncrease: number | 'unlimited'
  newFeatures: string[]
} {
  const fromPlan = PRICING_PLANS[fromPlanId]
  const toPlan = PRICING_PLANS[toPlanId]

  const generationsIncrease =
    toPlan.limits.generations === -1 ? 'unlimited' :
    fromPlan.limits.generations === -1 ? 0 :
    toPlan.limits.generations - fromPlan.limits.generations

  const projectsIncrease =
    toPlan.limits.projects === -1 ? 'unlimited' :
    fromPlan.limits.projects === -1 ? 0 :
    toPlan.limits.projects - fromPlan.limits.projects

  // Get features that are in toPlan but not in fromPlan
  const newFeatures = toPlan.features.filter(
    feature => !fromPlan.features.includes(feature)
  )

  return {
    generationsIncrease,
    projectsIncrease,
    newFeatures,
  }
}
