import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { checkRateLimits } from '../lib/limits.mts';

/**
 * Records that a personalised link (?for=company&role=...) was opened, so the
 * owner can see which applications got looked at. Only the company and role
 * labels from the URL are stored: no IP, no cookies, no visitor identifiers.
 * If NTFY_TOPIC is set, a push notification is also sent through ntfy.sh.
 */

const clean = (v: unknown) => (typeof v === 'string' ? v.replace(/[^A-Za-z0-9 &.,/+-]/g, '').trim().slice(0, 40) : '');

export default async (req: Request, context: Context): Promise<Response> => {
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      const host = new URL(origin).host;
      if (host !== req.headers.get('host') && !host.startsWith('localhost')) return new Response(null, { status: 403 });
    } catch {
      return new Response(null, { status: 403 });
    }
  }

  let body: { company?: unknown; role?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const company = clean(body.company);
  const role = clean(body.role);
  if (!company) return new Response(null, { status: 204 });

  if ((await checkRateLimits(context.ip || 'unknown', 'visit')) !== 'ok') return new Response(null, { status: 204 });

  const at = new Date().toISOString();
  try {
    const store = getStore('link-visits');
    await store.set(`${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, JSON.stringify({ company, role, at }));
  } catch {
    /* Blobs unavailable (local run) */
  }

  const topic = process.env.NTFY_TOPIC;
  if (topic) {
    try {
      await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
        method: 'POST',
        headers: { Title: 'Portfolio link opened' },
        body: `${company}${role ? ` (${role})` : ''} opened your personalised link.`,
      });
    } catch {
      /* notification is best-effort */
    }
  }
  return new Response(null, { status: 204 });
};
