import { getStore } from '@netlify/blobs';
import { timingSafeEqual, createHash } from 'crypto';

function safeCompare(a, b) {
  const valueA = Buffer.from(String(a || ''), 'utf8');
  const valueB = Buffer.from(String(b || ''), 'utf8');
  if (valueA.length !== valueB.length) {
    return false;
  }
  return timingSafeEqual(valueA, valueB);
}

function getAdminPassword(req) {
  const authHeader = req.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : '';
  const headerPassword = req.headers.get('x-admin-password');
  return bearerToken || headerPassword || '';
}

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const adminPassword = Netlify.env.get('ADMIN_PASSWORD') || '';
  if (!adminPassword) {
    return Response.json(
      { error: 'Admin password is not configured on the server.' },
      { status: 500 }
    );
  }

  const providedPassword = getAdminPassword(req);
  if (!safeCompare(providedPassword, adminPassword)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = getStore({ name: 'contact-messages', consistency: 'strong' });

  if (req.method === 'DELETE') {
    const id = context.params.id;
    if (!id) {
      return Response.json({ error: 'Invalid message id.' }, { status: 400 });
    }

    const existing = await store.get(id, { type: 'json' });
    if (!existing) {
      return Response.json({ error: 'Message not found.' }, { status: 404 });
    }

    await store.delete(id);
    return Response.json({
      message: 'Message deleted successfully.',
      deletedId: id,
    });
  }

  // GET - list messages
  const url = new URL(req.url);
  const rawLimit = Number(url.searchParams.get('limit') || 25);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100)
    : 25;

  const { blobs } = await store.list();
  // Sort by key descending (keys are timestamp-based so this gives newest first)
  const sortedKeys = blobs.map((b) => b.key).sort((a, b) => b.localeCompare(a));
  const limitedKeys = sortedKeys.slice(0, limit);

  const messages = [];
  for (const key of limitedKeys) {
    const msg = await store.get(key, { type: 'json' });
    if (msg) {
      messages.push(msg);
    }
  }

  return Response.json({ count: messages.length, messages });
};

export const config = {
  path: ['/api/admin/messages', '/api/admin/messages/:id'],
  method: ['GET', 'DELETE', 'OPTIONS'],
};
