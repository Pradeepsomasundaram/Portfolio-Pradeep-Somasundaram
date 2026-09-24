import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';

const LIMIT_PER_IP_HOUR = Number(process.env.RATE_LIMIT_PER_HOUR) || 12;
const LIMIT_GLOBAL_DAY = Number(process.env.RATE_LIMIT_PER_DAY) || 400;

const memoryCounts = new Map<string, number>();

/** Increments a counter and reports whether it is still within `limit`.
 * Uses Netlify Blobs so counts are shared across function instances; falls
 * back to per-instance memory if Blobs is unavailable (e.g. local runs).
 * Read-then-write isn't atomic, so this is a spend guard, not a hard quota. */
async function withinLimit(key: string, limit: number): Promise<boolean> {
  let count: number;
  try {
    const store = getStore('assistant-limits');
    count = Number((await store.get(key)) ?? 0) + 1;
    await store.set(key, String(count));
  } catch {
    count = (memoryCounts.get(key) ?? 0) + 1;
    memoryCounts.set(key, count);
  }
  return count <= limit;
}

/** `scope` keeps separate budgets for separate features (chat vs. message polish). */
export async function checkRateLimits(ip: string, scope = 'chat'): Promise<'ok' | 'ip' | 'global'> {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(0, 13);
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16);

  if (!(await withinLimit(`${scope}:day:${day}`, LIMIT_GLOBAL_DAY))) return 'global';
  if (!(await withinLimit(`${scope}:ip:${ipHash}:${hour}`, LIMIT_PER_IP_HOUR))) return 'ip';
  return 'ok';
}

/** Strips anything that could identify a person before a question is stored. */
export function anonymise(text: string): string {
  if (text.length > 400) return '[long text, e.g. a pasted job description]';
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    .replace(/https?:\/\/\S+/g, '[link]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, '[number]')
    .trim();
}

/** Records an anonymised visitor question (no IP, no identifiers) for the
 * private insights page. Failures are ignored: logging must never break chat. */
export async function logQuestion(question: string): Promise<void> {
  try {
    const store = getStore('assistant-questions');
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await store.set(key, JSON.stringify({ q: anonymise(question), at: new Date().toISOString() }));
  } catch {
    /* Blobs unavailable (local run) */
  }
}
