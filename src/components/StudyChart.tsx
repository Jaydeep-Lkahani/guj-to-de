import { useState } from 'react';
import { formatMinutes } from '../lib/format';
import { t } from '../lib/t';

interface Day {
  date: string; // YYYY-MM-DD
  minutes: number;
}

const HEIGHT = 140; // px of the plot area
const shortDate = (date: string) => `${date.slice(8)}/${date.slice(5, 7)}`;

/** Column chart of study minutes per day. Hover or focus a column for its value; the table has all values. */
export default function StudyChart({ days }: { days: Day[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(30, ...days.map((d) => d.minutes));
  const ticks = [max, max / 2, 0];
  const last = days.length - 1;

  return (
    <div>
      <div className="flex gap-2">
        <div
          className="flex flex-col justify-between text-right text-[11px] leading-none text-muted tabular-nums"
          style={{ height: HEIGHT }}
          aria-hidden="true"
        >
          {ticks.map((tick) => (
            <span key={tick}>{Math.round(tick)}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          {/* recessive gridlines at the tick values */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between"
            style={{ height: HEIGHT }}
          >
            {ticks.map((tick) => (
              <div key={tick} className="border-t border-line" />
            ))}
          </div>
          <div
            className="relative flex"
            style={{ height: HEIGHT }}
            onPointerLeave={() => setActive(null)}
          >
            {days.map((day, i) => {
              const height = Math.max(day.minutes > 0 ? 2 : 0, (day.minutes / max) * HEIGHT);
              return (
                <div
                  key={day.date}
                  tabIndex={0}
                  role="img"
                  aria-label={`${shortDate(day.date)}: ${formatMinutes(day.minutes)}`}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="relative flex min-w-0 flex-1 items-end justify-center outline-offset-0"
                >
                  {i === last && day.minutes > 0 && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold tabular-nums"
                      style={{ bottom: height + 3 }}
                    >
                      {day.minutes}
                    </span>
                  )}
                  <div
                    className="w-full max-w-6 rounded-t-md bg-gradient-to-t from-brand to-[#7a4be0]"
                    style={{ height, margin: '0 1px' }}
                  />
                </div>
              );
            })}
            {active !== null && (
              <div
                role="presentation"
                className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl border border-line bg-surface px-3 py-1.5 text-sm shadow-md"
                style={{
                  left: `${Math.min(88, Math.max(12, ((active + 0.5) / days.length) * 100))}%`,
                }}
              >
                <strong className="tabular-nums">{formatMinutes(days[active].minutes)}</strong>{' '}
                <span className="text-muted tabular-nums">{shortDate(days[active].date)}</span>
              </div>
            )}
          </div>
          <div className="mt-1 flex text-[10px] text-muted tabular-nums" aria-hidden="true">
            {days.map((day, i) => (
              <span key={day.date} className="min-w-0 flex-1 text-center">
                {i % 2 === last % 2 ? day.date.slice(8) : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold text-brand">
          {t('progressPage.showTable')}
        </summary>
        <table className="mt-2 w-full text-left text-sm">
          <thead>
            <tr className="text-muted">
              <th className="py-1 font-semibold">{t('progressPage.date')}</th>
              <th className="py-1 font-semibold">{t('progressPage.minutes')}</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.date} className="border-t border-line">
                <td className="py-1 tabular-nums">{shortDate(day.date)}</td>
                <td className="py-1 tabular-nums">{day.minutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
