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
