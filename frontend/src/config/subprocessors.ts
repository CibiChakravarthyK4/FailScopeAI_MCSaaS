export interface Subprocessor {
  name: string;
  purpose: string;
  dataProcessed: string;
  location: string;
}

// Only subprocessors that are actually true today - no invented vendor
// names. Hosting is explicitly "TBD" (CLAUDE.md Section 9) until a
// production host is chosen; update this row, don't guess at a provider.
export const subprocessors: Subprocessor[] = [
  {
    name: 'Language model provider (configured per deployment)',
    purpose: 'Automated analysis of test evidence to suggest a likely root cause.',
    dataProcessed: 'Redacted evidence from test artifacts (stack traces, log excerpts, screenshots) - secrets and credentials are stripped first.',
    location: "Depends on the provider used; see that provider's own data processing terms.",
  },
  {
    name: 'Hosting and database provider',
    purpose: 'Runs the application and stores workspace data.',
    dataProcessed: 'All workspace data (accounts, imported runs, artifacts, diagnoses, defects).',
    location: '[To be confirmed once a production host is chosen]',
  },
  {
    name: 'Jira (only if you connect it)',
    purpose: 'Receives exported defects, at your direction.',
    dataProcessed: 'The defect summary and evidence citations you choose to export.',
    location: 'Your own Jira instance - not controlled by us.',
  },
];
