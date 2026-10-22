export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  category: string;
  items: FaqItem[];
}

// Every answer must be accurate to what's actually built - anything not yet
// built is marked "Planned", never described as if it already works.
export const faqCategories: FaqCategory[] = [
  {
    category: 'Data and privacy',
    items: [
      {
        question: 'Where is my data stored?',
        answer:
          "Our production hosting location is still being finalized - we'll publish the specific region here once it's confirmed. See our Security and Trust page for the controls we have in place regardless of where that ends up.",
      },
      {
        question: 'Do you train on my data?',
        answer:
          "No. We don't use your uploaded artifacts to train our own or a third party's general-purpose models unless you agree to that separately, in writing.",
      },
      {
        question: 'What happens to my data if I close my account?',
        answer: 'You can request deletion of your account and workspace data at any time - see our Privacy Policy for details.',
      },
    ],
  },
  {
    category: 'How it works',
    items: [
      {
        question: 'Which test tools are supported?',
        answer:
          'Any test runner that can produce a standard JUnit XML report - pytest, JUnit, Jest and Mocha with a JUnit reporter, and many others. See our Supported JUnit formats help article for details.',
      },
      {
        question: 'How is this different from my CI reports?',
        answer:
          "Your CI report tells you a test failed. We add an evidence-backed diagnosis and a human review step on top, so you get a likely cause with citations back to the exact evidence, not just a red X.",
      },
      {
        question: 'Do I need to install anything?',
        answer: 'No. Importing a run is a file upload through the web app - no agent, plugin or CLI tool required.',
      },
    ],
  },
  {
    category: 'Accounts and plans',
    items: [
      {
        question: 'How much does it cost?',
        answer: 'Billing is arranged with our team during the pilot - see our Pricing page for plan details.',
      },
      {
        question: 'Can I have multiple people on my team?',
        answer:
          'Yes. A workspace supports Admin, Analyst, Reviewer and Viewer roles - see our Roles and permissions help article.',
      },
      {
        question: 'Is there a free trial?',
        answer: "There's no published free tier yet. Request a demo and we can discuss a pilot arrangement.",
      },
    ],
  },
  {
    category: 'Integrations',
    items: [
      {
        question: 'Does this integrate with Jira?',
        answer:
          'Planned. The defect export flow is built end to end in the app; connecting it to your own Jira instance is still in progress.',
      },
      {
        question: 'What about Slack or email notifications?',
        answer: 'Planned - not built yet.',
      },
    ],
  },
];
