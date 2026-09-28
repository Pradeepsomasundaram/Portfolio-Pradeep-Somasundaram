import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';
import { notify } from './notify.mts';

const LIMIT_PER_IP_HOUR = Number(process.env.RATE_LIMIT_PER_HOUR) || 12;
const LIMIT_GLOBAL_DAY = Number(process.env.RATE_LIMIT_PER_DAY) || 400;

const memoryCounts = new Map<string, number>();
const memoryAlerted = new Set<string>();
const ALERT_THRESHOLD = 0.8; // fraction of the daily cap that triggers a one-time heads-up

/** Increments a counter and reports the new count and whether it is still
 * within `limit`. Uses Netlify Blobs so counts are shared across function
 * instances; falls back to per-instance memory if Blobs is unavailable (e.g.
 * local runs). Read-then-write isn't atomic, so this is a spend guard, not a
 * hard quota. */
async function withinLimit(key: string, limit: number): Promise<{ ok: boolean; count: number }> {
  let count: number;
  try {
    const store = getStore('assistant-limits');
    count = Number((await store.get(key)) ?? 0) + 1;
    await store.set(key, String(count));
  } catch {
    count = (memoryCounts.get(key) ?? 0) + 1;
    memoryCounts.set(key, count);
  }
  return { ok: count <= limit, count };
}

/** Sends one push notification per scope per day once usage crosses
 * ALERT_THRESHOLD of the daily cap, so a runaway bot or a bug shows up before
 * the cap is actually hit. Best-effort and not perfectly race-free — a small
 * risk of a duplicate or missed alert is fine for a heads-up like this. */
async function maybeAlertOnHighUsage(scope: string, day: string, count: number, limit: number): Promise<void> {
  if (!process.env.NTFY_TOPIC || count < Math.ceil(limit * ALERT_THRESHOLD)) return;
  const flagKey = `${scope}:day:${day}:alerted`;
  try {
    const store = getStore('assistant-limits');
    if (await store.get(flagKey)) return;
    await store.set(flagKey, '1');
  } catch {
    // No durable store (e.g. local dev without Blobs) — dedupe per-process instead,
    // same fallback pattern withinLimit uses, so the alert still fires at least once.
    if (memoryAlerted.has(flagKey)) return;
    memoryAlerted.add(flagKey);
  }
  await notify('Portfolio AI usage high', `"${scope}" has hit ${count}/${limit} requests today.`);
}

/** `scope` keeps separate budgets for separate features (chat vs. message polish). */
export async function checkRateLimits(ip: string, scope = 'chat'): Promise<'ok' | 'ip' | 'global'> {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(0, 13);
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16);

  const dayResult = await withinLimit(`${scope}:day:${day}`, LIMIT_GLOBAL_DAY);
  await maybeAlertOnHighUsage(scope, day, dayResult.count, LIMIT_GLOBAL_DAY);
  if (!dayResult.ok) return 'global';
  if (!(await withinLimit(`${scope}:ip:${ipHash}:${hour}`, LIMIT_PER_IP_HOUR)).ok) return 'ip';
  return 'ok';
}

/** Today's request count per scope, for the insights dashboard. Best-effort:
 * returns zeros if Blobs is unavailable rather than failing the page. */
export async function usageSnapshot(scopes: string[]): Promise<{ scope: string; count: number; limit: number }[]> {
  const day = new Date().toISOString().slice(0, 10);
  try {
    const store = getStore('assistant-limits');
    return await Promise.all(
      scopes.map(async (scope) => ({ scope, count: Number((await store.get(`${scope}:day:${day}`)) ?? 0), limit: LIMIT_GLOBAL_DAY }))
    );
  } catch {
    return scopes.map((scope) => ({ scope, count: 0, limit: LIMIT_GLOBAL_DAY }));
  }
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
