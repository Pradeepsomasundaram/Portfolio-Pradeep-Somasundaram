import { getStore } from '@netlify/blobs';
import aboutData from '../../src/data/about.json';

/**
 * Real GitHub contribution counts for the last 12 weeks, merged across both of
 * Pradeep's accounts. GitHub's contribution calendar is GraphQL-only and always
 * requires an authenticated token (even for public data) — a personal access
 * token with no scopes is enough. Without GITHUB_TOKEN this returns 501 and the
 * client hides the chart rather than showing anything invented.
 */

const LOGINS: string[] = aboutData.githubAccounts ?? [];
const WEEKS = 12;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // GitHub's calendar changes at most daily; cache generously

interface Day {
  date: string;
  count: number;
}

const QUERY = `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

interface ApiDay {
  date: string;
  contributionCount: number;
}

async function fetchDays(login: string, from: Date, to: Date, token: string): Promise<Day[]> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { login, from: from.toISOString(), to: to.toISOString() } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL returned ${res.status}`);
  const json = (await res.json()) as {
    errors?: { message: string }[];
    data?: { user: { contributionsCollection: { contributionCalendar: { weeks: { contributionDays: ApiDay[] }[] } } } | null };
  };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  const weeks = json.data?.user?.contributionsCollection.contributionCalendar.weeks ?? [];
  return weeks.flatMap((w) => w.contributionDays).map((d) => ({ date: d.date, count: d.contributionCount }));
}

export default async (): Promise<Response> => {
  const token = process.env.GITHUB_TOKEN;
  if (!token || LOGINS.length === 0) {
    return new Response(JSON.stringify({ available: false }), {
      status: 501,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  const cacheKey = `contrib:${LOGINS.join(',')}`;
  try {
    const store = getStore('github-cache');
    const cached = await store.get(cacheKey, { type: 'json' });
    if (cached && typeof cached === 'object' && 'at' in cached && Date.now() - (cached as { at: number }).at < CACHE_TTL_MS) {
      return new Response(JSON.stringify((cached as { body: unknown }).body), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }
  } catch {
    /* Blobs unavailable — fall through and fetch fresh */
  }

  const to = new Date();
  const from = new Date(to.getTime() - WEEKS * 7 * 24 * 60 * 60 * 1000);

  let merged: Map<string, number>;
  try {
    const perAccount = await Promise.all(LOGINS.map((login) => fetchDays(login, from, to, token)));
    merged = new Map();
    for (const days of perAccount) {
      for (const d of days) merged.set(d.date, (merged.get(d.date) ?? 0) + d.count);
    }
  } catch (err) {
    console.error('contributions fetch failed', err);
    return new Response(JSON.stringify({ available: false }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  const days = [...merged.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const body = { available: true, days, total, accounts: LOGINS };

  try {
    const store = getStore('github-cache');
    await store.set(cacheKey, JSON.stringify({ at: Date.now(), body }));
  } catch {
    /* best-effort cache */
  }

  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
};
