// Single source of truth for every company fact shown in the public site:
// legal pages, footer, contact details, pricing framing. Nothing outside
// this file may hard-code a company fact - if a page needs one, it imports
// it from here. Replace every "[placeholder]" value before launch; nothing
// here is a real claim yet.
export const company = {
  productName: 'RootTrace Ivory',
  legalName: '[Company legal name]',
  shortDescription: 'Find the root cause of every failed test, backed by evidence.',

  supportEmail: '[support email]',
  salesEmail: '[sales email]',
  hiringEmail: '[hiring email]',
  securityEmail: '[security email]',
  phone: '[phone number]',
  address: '[registered address]',
  workingHours: '[working hours]',

  grievanceOfficer: {
    name: '[Grievance Officer name]',
    email: '[grievance officer email]',
    address: '[grievance officer address]',
  },

  jurisdiction: {
    country: 'India',
    courtsCity: '[city]',
  },

  legal: {
    // One version/date per document, shown on the page and recorded against
    // every acceptance (C05). Bump the version string whenever the wording
    // changes materially - existing users are asked to re-accept.
    privacy: { version: '0.1-draft', effectiveDate: '[effective date]' },
    terms: { version: '0.1-draft', effectiveDate: '[effective date]' },
    // Controls the visible "Draft for legal review" banner on every legal page.
    // Flip to false only once real counsel has reviewed the text.
    isDraftForLegalReview: true,
  },
} as const;

export type Company = typeof company;
