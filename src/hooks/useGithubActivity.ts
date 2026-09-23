import { useEffect, useState } from 'react';

export interface GithubRepo {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
}

export interface GithubEvent {
  id: string;
  type: string;
  repo: string;
  createdAt: string;
  detail: string;
}

export interface GithubActivity {
  login: string;
  profileUrl: string;
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

async function load(login: string): Promise<GithubActivity> {
  const base = `https://api.github.com/users/${login}`;
  const [user, repos, events] = await Promise.all([
    getJson<{ login: string; html_url: string; public_repos: number; followers: number }>(base),
    getJson<ApiRepo[]>(`${base}/repos?per_page=100&sort=pushed`),
    getJson<ApiEvent[]>(`${base}/events/public?per_page=30`),
  ]);

  const own = repos.filter((r) => !r.fork);
  const langCounts = new Map<string, number>();
  own.forEach((r) => {
    if (r.language) langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
  });

  return {
    login: user.login,
    profileUrl: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    totalStars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
    languages: [...langCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    recentRepos: own.slice(0, 5).map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
    })),
    events: events.slice(0, 5).map((e) => ({
      id: e.id,
      type: e.type,
      repo: e.repo.name.split('/').pop() ?? e.repo.name,
      createdAt: e.created_at,
      detail: describeEvent(e),
    })),
  };
}

/** Fetches public GitHub data once `enabled` flips true, cached for 15 min
 * per session so repeat visits don't burn the unauthenticated rate limit. */
export function useGithubActivity(login: string, enabled: boolean): State {
  const [state, setState] = useState<State>({ status: 'idle' });

  useEffect(() => {
    if (!enabled) return;
    const key = `gh-activity:${login}`;
    try {
      const cached = sessionStorage.getItem(key);
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
    load(login)
      .then((data) => {
        if (cancelled) return;
        try {
          sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
        } catch { /* storage full/blocked */ }
        setState({ status: 'ready', data });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({
          status: 'error',
          message: err.message === 'rate-limited' ? 'GitHub rate limit reached' : 'Could not reach GitHub',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [login, enabled]);

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
