import api from './api';

export interface CareerRole {
  title: string;
  team: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}

export async function listOpenRoles(): Promise<CareerRole[]> {
  const { data } = await api.get<CareerRole[]>('/api/public/careers/roles');
  return data;
}

export async function submitCareerApplication(form: {
  role: string;
  name: string;
  email: string;
  phone?: string;
  links?: string;
  note?: string;
  consent: boolean;
  website: string;
  resume: File;
}): Promise<void> {
  const body = new FormData();
  body.append('role', form.role);
  body.append('name', form.name);
  body.append('email', form.email);
  if (form.phone) body.append('phone', form.phone);
  if (form.links) body.append('links', form.links);
  if (form.note) body.append('note', form.note);
  body.append('consent', String(form.consent));
  body.append('website', form.website);
  body.append('resume', form.resume);

  await api.post('/api/public/careers/applications', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
