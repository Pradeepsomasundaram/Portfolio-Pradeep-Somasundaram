import { useEffect, useState } from 'react';

export interface GithubRepo {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  /** Which of the merged accounts this repo belongs to. */
  account: string;
}

export interface GithubEvent {
  id: string;
  type: string;
  repo: string;
  createdAt: string;
  detail: string;
  account: string;
}

export interface GithubAccountStats {
  login: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
}

export interface GithubActivity {
  /** One entry per account that loaded successfully, for "View profile" links and per-account counts. */
  accounts: GithubAccountStats[];
  publicRepos: number;
  followers: number;
  totalStars: number;
  languages: { name: string; count: number }[];
  recentRepos: GithubRepo[];
  events: GithubEvent[];
}

type State =
  | { status: 'idle' | 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: GithubActivity };

const CACHE_TTL_MS = 15 * 60 * 1000;

interface ApiRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
}

interface ApiEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: { commits?: unknown[]; size?: number; action?: string; ref_type?: string };
}

function describeEvent(e: ApiEvent): string {
  switch (e.type) {
    case 'PushEvent': {
      const n = e.payload.size ?? e.payload.commits?.length ?? 1;
      return `Pushed ${n} commit${n === 1 ? '' : 's'}`;
    }
    case 'CreateEvent':
      return `Created ${e.payload.ref_type ?? 'repository'}`;
    case 'PullRequestEvent':
      return `${e.payload.action ?? 'Updated'} a pull request`;
    case 'IssuesEvent':
      return `${e.payload.action ?? 'Updated'} an issue`;
    case 'WatchEvent':
      return 'Starred a repository';
    case 'ForkEvent':
      return 'Forked a repository';
    default:
      return e.type.replace(/Event$/, '');
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (res.status === 403 || res.status === 429) throw new Error('rate-limited');
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
  return res.json() as Promise<T>;
}

interface LoadedAccount {
  login: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  ownRepos: ApiRepo[];
  events: ApiEvent[];
}

async function loadAccount(login: string): Promise<LoadedAccount> {
  const base = `https://api.github.com/users/${login}`;
  const [user, repos, events] = await Promise.all([
    getJson<{ login: string; html_url: string; public_repos: number; followers: number }>(base),
    getJson<ApiRepo[]>(`${base}/repos?per_page=100&sort=pushed`),
    getJson<ApiEvent[]>(`${base}/events/public?per_page=30`),
  ]);
  return {
    login: user.login,
    profileUrl: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    ownRepos: repos.filter((r) => !r.fork),
    events,
  };
}

/** Fetches and merges public GitHub data for one or more accounts once `enabled`
 * flips true, cached for 15 min per session so repeat visits don't burn the
 * unauthenticated rate limit. A account that fails to load is silently dropped
 * rather than failing the whole widget, as long as at least one succeeds. */
export function useGithubActivity(logins: string[], enabled: boolean): State {
  const [state, setState] = useState<State>({ status: 'idle' });
  const key = logins.join(',');

  useEffect(() => {
    if (!enabled || logins.length === 0) return;
    const cacheKey = `gh-activity:${key}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { at, data } = JSON.parse(cached) as { at: number; data: GithubActivity };
        if (Date.now() - at < CACHE_TTL_MS) {
          setState({ status: 'ready', data });
          return;
        }
      }
    } catch { /* ignore bad cache */ }

    let cancelled = false;
    setState({ status: 'loading' });

    Promise.allSettled(logins.map(loadAccount)).then((results) => {
      if (cancelled) return;
      const loaded = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
      if (loaded.length === 0) {
        const rateLimited = results.some((r) => r.status === 'rejected' && r.reason?.message === 'rate-limited');
        setState({ status: 'error', message: rateLimited ? 'GitHub rate limit reached' : 'Could not reach GitHub' });
        return;
      }

      const langCounts = new Map<string, number>();
      const allRepos: GithubRepo[] = [];
      const allEvents: GithubEvent[] = [];
      let totalStars = 0;
      for (const acc of loaded) {
        for (const r of acc.ownRepos) {
          totalStars += r.stargazers_count;
          if (r.language) langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
          allRepos.push({
            name: r.name,
            url: r.html_url,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
            pushedAt: r.pushed_at,
            account: acc.login,
          });
        }
        for (const e of acc.events) {
          allEvents.push({
            id: `${acc.login}-${e.id}`,
            type: e.type,
            repo: e.repo.name.split('/').pop() ?? e.repo.name,
            createdAt: e.created_at,
            detail: describeEvent(e),
            account: acc.login,
          });
        }
      }

      const data: GithubActivity = {
        accounts: loaded.map((a) => ({ login: a.login, profileUrl: a.profileUrl, publicRepos: a.publicRepos, followers: a.followers })),
        publicRepos: loaded.reduce((sum, a) => sum + a.publicRepos, 0),
        followers: loaded.reduce((sum, a) => sum + a.followers, 0),
        totalStars,
        languages: [...langCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5),
        recentRepos: allRepos.sort((a, b) => b.pushedAt.localeCompare(a.pushedAt)).slice(0, 5),
        events: allEvents.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
      };
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data }));
      } catch { /* storage full/blocked */ }
      setState({ status: 'ready', data });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return state;
}

export function timeAgo(iso: string, short = false): string {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units: [number, string, string][] = [
    [31536000, 'year', 'y'],
    [2592000, 'month', 'mo'],
    [86400, 'day', 'd'],
    [3600, 'hour', 'h'],
    [60, 'minute', 'm'],
  ];
  for (const [size, label, abbr] of units) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return short ? `${n}${abbr} ago` : `${n} ${label}${n === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
}
