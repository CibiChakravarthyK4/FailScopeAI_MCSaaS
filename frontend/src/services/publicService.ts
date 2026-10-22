import api from './api';

export type ContactTopic =
  | 'product_question'
  | 'sales'
  | 'support'
  | 'security_or_privacy'
  | 'partnership'
  | 'other';

export async function submitContact(form: {
  name: string;
  email: string;
  company?: string;
  topic: ContactTopic;
  message: string;
  consent: boolean;
  website: string;
}): Promise<void> {
  await api.post('/api/public/contact', {
    name: form.name,
    email: form.email,
    company: form.company || undefined,
    topic: form.topic,
    message: form.message,
    consent: form.consent,
    website: form.website,
  });
}

export type TeamSize = '1-5' | '6-20' | '21-50' | '50+';

export async function submitDemoRequest(form: {
  name: string;
  email: string;
  company: string;
  role: string;
  teamSize: TeamSize;
  wantToSee?: string;
  preferredTime?: string;
  consent: boolean;
  website: string;
}): Promise<void> {
  await api.post('/api/public/demo', {
    name: form.name,
    email: form.email,
    company: form.company,
    role: form.role,
    team_size: form.teamSize,
    want_to_see: form.wantToSee || undefined,
    preferred_time: form.preferredTime || undefined,
    consent: form.consent,
    website: form.website,
  });
}
