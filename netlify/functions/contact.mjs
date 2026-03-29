import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await req.json();
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const subject = String(body.subject || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return Response.json(
      { error: 'Please fill in all required fields.' },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  if (name.length > 120 || email.length > 160 || subject.length > 180 || message.length > 4000) {
    return Response.json(
      { error: 'One or more fields exceed the maximum length.' },
      { status: 400 }
    );
  }

  const store = getStore({ name: 'contact-messages', consistency: 'strong' });
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  await store.setJSON(id, {
    _id: id,
    name,
    email,
    subject,
    message,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return Response.json({
    message: "Thanks for reaching out. I'll get back to you soon.",
  });
};

export const config = {
  path: '/api/contact',
  method: ['POST', 'OPTIONS'],
};
