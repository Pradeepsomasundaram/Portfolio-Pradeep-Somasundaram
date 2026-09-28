import { useEffect, useState } from 'react';

interface Day {
  date: string;
  count: number;
}

type State = { status: 'loading' | 'unavailable' } | { status: 'ready'; days: Day[]; total: number };

/** Real GitHub contribution counts for the last ~12 weeks, merged across both
 * accounts, fetched from the `contributions` function. Renders nothing (not an
 * error message) when the data isn't available, so the site never implies
 * activity it can't back up with a real number. */
export const ContributionHeatmap = () => {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch('/.netlify/functions/contributions')
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (cancelled) return;
        if (ok && body.available) setState({ status: 'ready', days: body.days, total: body.total });
        else setState({ status: 'unavailable' });
      })
      .catch(() => !cancelled && setState({ status: 'unavailable' }));
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status !== 'ready') return null;

  // Pad the front so the grid always starts on a Sunday, matching GitHub's own layout.
  const first = new Date(state.days[0]?.date ?? Date.now());
  const padding: Day[] = Array.from({ length: first.getDay() }, () => ({ date: '', count: -1 }));
  const cells = [...padding, ...state.days];
  const weeks: Day[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const max = Math.max(1, ...state.days.map((d) => d.count));
  const shade = (count: number) => {
    if (count < 0) return 'transparent';
    if (count === 0) return 'rgba(255,255,255,0.06)';
    const t = count / max;
    return t > 0.75 ? '#0EA57A' : t > 0.5 ? '#0EA57A99' : t > 0.25 ? '#0EA57A66' : '#0EA57A33';
  };

  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Real contributions, last {weeks.length} weeks
        </p>
        <p className="text-xs font-mono text-secondary">{state.total} total</p>
      </div>
      <div className="flex gap-[3px] overflow-x-auto pb-1" role="img" aria-label={`${state.total} GitHub contributions over the last ${weeks.length} weeks`}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                title={day.date ? `${day.date}: ${day.count} contribution${day.count === 1 ? '' : 's'}` : undefined}
                className="w-[11px] h-[11px] rounded-sm"
                style={{ background: shade(day.count) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
