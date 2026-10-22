// Placeholder plan names and feature sets, not real prices - CLAUDE.md
// Section 16: billing is pre-release/manual, no payment provider is
// integrated yet. Nothing here should ever render a number.
export interface PricingPlan {
  name: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  ctaTo: string;
  highlighted?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Pilot',
    tagline: 'Try RootTrace Ivory with one team on a real project.',
    features: ['One workspace', 'Core import and diagnosis flow', 'Email support'],
    ctaLabel: 'Request a demo',
    ctaTo: '/demo',
  },
  {
    name: 'Team',
    tagline: 'For teams running this as part of daily work.',
    features: ['Everything in Pilot', 'Multiple reviewers', 'Usage and quota dashboard', 'Priority support'],
    ctaLabel: 'Contact sales',
    ctaTo: '/contact',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    tagline: 'For organizations with multiple teams and workspaces.',
    features: ['Everything in Team', 'Multiple workspaces', 'Dedicated onboarding', 'Custom retention terms'],
    ctaLabel: 'Contact sales',
    ctaTo: '/contact',
  },
];

export interface ComparisonRow {
  feature: string;
  pilot: boolean;
  team: boolean;
  enterprise: boolean;
}

export const comparisonRows: ComparisonRow[] = [
  { feature: 'JUnit import (XML, logs, screenshots)', pilot: true, team: true, enterprise: true },
  { feature: 'Evidence-backed diagnosis', pilot: true, team: true, enterprise: true },
  { feature: 'Human review and defect export', pilot: true, team: true, enterprise: true },
  { feature: 'Multiple reviewers', pilot: false, team: true, enterprise: true },
  { feature: 'Usage and quota dashboard', pilot: false, team: true, enterprise: true },
  { feature: 'Multiple workspaces', pilot: false, team: false, enterprise: true },
  { feature: 'Dedicated onboarding', pilot: false, team: false, enterprise: true },
];

export const billingFaq = [
  {
    question: 'How is billing arranged during the pilot?',
    answer: 'Billing is arranged directly with our team during the pilot - there is no self-serve checkout yet.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes. Talk to us when your needs change and we will work out the right plan with you.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'There is no published free tier yet - request a demo and we can discuss a pilot arrangement.',
  },
];
