import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

/**
 * Private dashboard of what visitors ask the assistant. Protected by the
 * INSIGHTS_KEY environment variable (open /.netlify/functions/insights?key=...).
 * Stored questions are anonymised before they are saved and carry no IP.
 */

const STOP = new Set(
  'a an the and or of to in on for with is are was were be been what which who whom whose how why when where do does did can could would should about his he him her she they them me my i you your it its this that these those at as by from has have had not no yes tell show give any some there their than then'.split(' ')
);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export default async (req: Request): Promise<Response> => {
  const expected = process.env.INSIGHTS_KEY;
  if (!expected) return new Response('Insights are not configured (set INSIGHTS_KEY).', { status: 503 });
  const key = new URL(req.url).searchParams.get('key') ?? '';
  if (!safeEqual(key, expected)) return new Response('Not found', { status: 404 });

  let items: { q: string; at: string }[] = [];
  try {
    const store = getStore('assistant-questions');
    const { blobs } = await store.list();
    const recent = blobs.map((b) => b.key).sort().slice(-300);
    const rows = await Promise.all(recent.map((k) => store.get(k, { type: 'json' }) as Promise<{ q: string; at: string } | null>));
    items = rows.filter((r): r is { q: string; at: string } => !!r && typeof r.q === 'string');
  } catch {
    /* Blobs unavailable */
  }

  let visits: { company: string; role: string; at: string }[] = [];
  try {
    const vstore = getStore('link-visits');
    const { blobs } = await vstore.list();
    const keys = blobs.map((b) => b.key).sort().slice(-200);
    const rows = await Promise.all(keys.map((k) => vstore.get(k, { type: 'json' }) as Promise<{ company: string; role: string; at: string } | null>));
    visits = rows.filter((r): r is { company: string; role: string; at: string } => !!r && typeof r.company === 'string');
  } catch {
    /* Blobs unavailable */
  }
  const byCompany = new Map<string, { n: number; last: string; role: string }>();
  for (const v of visits) {
    const prev = byCompany.get(v.company);
    byCompany.set(v.company, { n: (prev?.n ?? 0) + 1, last: v.at > (prev?.last ?? '') ? v.at : prev!.last, role: v.role || prev?.role || '' });
  }
  const companies = [...byCompany.entries()].sort((a, b) => b[1].last.localeCompare(a[1].last));

  const words = new Map<string, number>();
  const perDay = new Map<string, number>();
  for (const { q, at } of items) {
    perDay.set(at.slice(0, 10), (perDay.get(at.slice(0, 10)) ?? 0) + 1);
    for (const w of q.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) ?? []) if (!STOP.has(w)) words.set(w, (words.get(w) ?? 0) + 1);
  }
  const topWords = [...words.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  const days = [...perDay.entries()].sort().slice(-14);
  const maxDay = Math.max(1, ...days.map(([, n]) => n));

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Assistant insights</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font:15px/1.5 system-ui,sans-serif;background:#0b0b0b;color:#e8e6df;max-width:760px;margin:0 auto;padding:24px}
h1{color:#C9A227}h2{color:#0EA57A;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:28px}
.chip{display:inline-block;border:1px solid #C9A22766;border-radius:99px;padding:2px 10px;margin:3px;font-size:13px}
.bar{display:flex;align-items:center;gap:8px;font-size:12px;color:#aaa}.bar i{display:block;height:10px;background:#C9A227;border-radius:3px}
li{margin:6px 0;color:#ccc}small{color:#777}</style></head><body>
<h1>What visitors ask</h1><p>${items.length} recent questions (anonymised, latest 300).</p>
<h2>Personalised link opens</h2>${
    companies.length
      ? `<ul>${companies.map(([c, v]) => `<li><b>${esc(c)}</b>${v.role ? ` <small>(${esc(v.role)})</small>` : ''} — ${v.n} open${v.n === 1 ? '' : 's'}, last ${esc(v.last.slice(0, 16).replace('T', ' '))} UTC</li>`).join('')}</ul>`
      : '<small>No opens yet. Your own test visits count too.</small>'
  }
<h2>Top topics</h2><div>${topWords.map(([w, n]) => `<span class="chip">${esc(w)} · ${n}</span>`).join('') || '<small>No data yet.</small>'}</div>
<h2>Questions per day</h2>${days.map(([d, n]) => `<div class="bar"><span style="width:82px">${d}</span><i style="width:${(n / maxDay) * 240}px"></i>${n}</div>`).join('') || '<small>No data yet.</small>'}
<h2>Latest questions</h2><ul>${items.slice(-40).reverse().map((i) => `<li>${esc(i.q)} <small>${esc(i.at.slice(0, 16).replace('T', ' '))}</small></li>`).join('')}</ul>
</body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
};
