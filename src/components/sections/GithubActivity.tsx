import { useInView } from 'react-intersection-observer';
import { FaGithub, FaStar, FaCodeBranch } from 'react-icons/fa';
import { HiExternalLink } from 'react-icons/hi';
import { AnimatedSection } from '../ui';
import { useGithubActivity, timeAgo } from '../../hooks/useGithubActivity';
import aboutData from '../../data/about.json';

const login = aboutData.social.github.split('/').filter(Boolean).pop() ?? '';

const languageColors: Record<string, string> = {
  'Jupyter Notebook': '#DA5B0B',
  Python: '#3572A5',
  JavaScript: '#F1E05A',
  TypeScript: '#3178C6',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Java: '#B07219',
  'C++': '#F34B7D',
  R: '#198CE7',
};
const colorFor = (lang: string) => languageColors[lang] ?? '#C9A227';

export const GithubActivity = () => {
  // Only hit the API once a visitor actually scrolls here (unauthenticated
  // requests are limited to 60/hour per IP).
  const [ref, inView] = useInView({ triggerOnce: true, rootMargin: '200px' });
  const state = useGithubActivity(login, inView);

  return (
    <section id="github" className="py-20 px-4" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-2 heading-shimmer">
            GitHub Activity
          </h2>
          <p className="text-center font-mono text-xs text-secondary/80 mb-10">
            // live from the GitHub API
          </p>

          {(state.status === 'idle' || state.status === 'loading') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl glass-panel animate-pulse" />
              ))}
            </div>
          )}

          {state.status === 'error' && (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {state.message} — live stats are unavailable right now.
              </p>
              <a
                href={`https://github.com/${login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <FaGithub /> View {login} on GitHub <HiExternalLink />
              </a>
            </div>
          )}

          {state.status === 'ready' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Public repos', value: state.data.publicRepos },
                  { label: 'Followers', value: state.data.followers },
                  state.data.totalStars > 0
                    ? { label: 'Stars earned', value: state.data.totalStars }
                    : { label: 'Languages', value: state.data.languages.length },
                  {
                    label: 'Last push',
                    value: state.data.recentRepos[0] ? timeAgo(state.data.recentRepos[0].pushedAt, true) : '—',
                  },
                ].map((s) => (
                  <div key={s.label} className="glass-panel rounded-xl p-4 text-center">
                    <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {state.data.languages.length > 0 && (
                <div className="glass-panel rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                    Languages across repos
                  </p>
                  <div className="flex h-2.5 rounded-full overflow-hidden mb-3">
                    {state.data.languages.map((l) => (
                      <div
                        key={l.name}
                        style={{ flex: l.count, background: colorFor(l.name) }}
                        title={`${l.name}: ${l.count} repos`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                    {state.data.languages.map((l) => (
                      <span key={l.name} className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: colorFor(l.name) }} />
                        {l.name} <span className="text-gray-400 text-xs">({l.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-panel rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                    Recently updated
                  </p>
                  <ul className="space-y-3">
                    {state.data.recentRepos.map((r) => (
                      <li key={r.name}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate flex items-center gap-2">
                              <FaCodeBranch className="w-3 h-3 shrink-0 text-secondary" />
                              {r.name}
                            </span>
                            <span className="text-xs text-gray-400 shrink-0 font-mono">
                              {timeAgo(r.pushedAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5 pl-5">
                            {r.language && (
                              <span className="inline-flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ background: colorFor(r.language) }} />
                                {r.language}
                              </span>
                            )}
                            {r.stars > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <FaStar className="w-3 h-3" /> {r.stars}
                              </span>
                            )}
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-panel rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                    Latest activity
                  </p>
                  {state.data.events.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent public activity.</p>
                  ) : (
                    <ul className="space-y-3 border-l border-primary/30 pl-4">
                      {state.data.events.map((e) => (
                        <li key={e.id} className="relative text-sm">
                          <span className="absolute -left-[1.3rem] top-1.5 w-2 h-2 rounded-full bg-primary" />
                          <p className="text-gray-800 dark:text-gray-200">
                            {e.detail} <span className="text-secondary">in {e.repo}</span>
                          </p>
                          <p className="text-xs text-gray-400 font-mono">{timeAgo(e.createdAt)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="text-center">
                <a
                  href={state.data.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm"
                >
                  <FaGithub /> View full profile on GitHub <HiExternalLink />
                </a>
              </div>
            </div>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};
