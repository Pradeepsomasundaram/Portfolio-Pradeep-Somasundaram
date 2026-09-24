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

const ATTEMPT_TIMEOUT_MS = 6000; // wait for response headers only; streaming bodies aren't cut off
const DEADLINE_MS = 9000; // stop starting new attempts so the function stays inside Netlify's limit
const PASSES = 2; // free-tier overload is often momentary, so the whole chain gets one retry

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Calls Gemini, falling back through the model list on retryable failures and
 * retrying the whole list once. Returns the first successful response, or the
 * last failure. */
export async function callGemini(
  apiKey: string,
  method: 'streamGenerateContent?alt=sse' | 'generateContent',
  body: unknown
): Promise<Response> {
  const started = Date.now();
  let last: Response | undefined;

  for (let pass = 0; pass < PASSES; pass++) {
    for (const model of modelOrder()) {
      if (last && Date.now() - started > DEADLINE_MS) return last;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(`${API_BASE}/models/${model}:${method}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } catch {
        console.error('gemini model timed out or failed to connect', model);
        last = new Response(null, { status: 503 });
        continue;
      } finally {
        clearTimeout(timer); // headers arrived (or we gave up); never cut a streaming body short
      }

      if (res.ok) {
        preferred = { model, until: Date.now() + 2 * 60 * 1000 };
        return res;
      }
      console.error('gemini model failed', model, res.status);
      if (!RETRYABLE.has(res.status)) return res; // e.g. 400/401/403: another model won't help
      if (last) await last.body?.cancel().catch(() => undefined);
      last = res;
    }
    if (pass < PASSES - 1) await sleep(1000);
  }
  return last as Response;
}
