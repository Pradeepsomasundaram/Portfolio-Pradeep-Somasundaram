const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Tried in order. GEMINI_MODEL (if set) goes first. A model that is overloaded,
// missing or out of free-tier quota is skipped so one bad model can't take the
// assistant down.
const DEFAULT_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];

// Statuses another model might not share: not found, quota, server error, overload
const RETRYABLE = new Set([404, 429, 500, 503]);

let preferred: { model: string; until: number } | null = null;

function modelOrder(): string[] {
  const configured = process.env.GEMINI_MODEL;
  const base = configured ? [configured, ...DEFAULT_MODELS.filter((m) => m !== configured)] : DEFAULT_MODELS;
  // Start with whichever model worked most recently so healthy requests stay fast
  if (preferred && preferred.until > Date.now() && base.includes(preferred.model)) {
    return [preferred.model, ...base.filter((m) => m !== preferred!.model)];
  }
  return base;
}

/** Calls Gemini, falling back through the model list on retryable failures.
 * Returns the first successful response, or the last failure. */
export async function callGemini(
  apiKey: string,
  method: 'streamGenerateContent?alt=sse' | 'generateContent',
  body: unknown
): Promise<Response> {
  let last: Response | undefined;
  for (const model of modelOrder()) {
    const res = await fetch(`${API_BASE}/models/${model}:${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      preferred = { model, until: Date.now() + 2 * 60 * 1000 };
      return res;
    }
    console.error('gemini model failed', model, res.status);
    if (!RETRYABLE.has(res.status)) return res; // e.g. 400/401/403: another model won't help
    if (last) await last.body?.cancel().catch(() => undefined);
    last = res;
  }
  return last as Response;
}
