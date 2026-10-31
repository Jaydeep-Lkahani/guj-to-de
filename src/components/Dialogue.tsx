import { useState } from 'react';
import { t } from '../lib/t';
import AudioButton from './AudioButton';
import { Btn } from './exercises/ui';

interface Line {
  speaker: string;
  de: string;
  gu: string;
}

/** German dialogue with audio per line and a toggle for the Gujarati translation. */
export default function Dialogue({ lines }: { lines: Line[] }) {
  const [showGu, setShowGu] = useState(false);
  const speakers = [...new Set(lines.map((line) => line.speaker))];
  return (
    <div>
      <Btn variant="secondary" aria-pressed={showGu} onClick={() => setShowGu(!showGu)}>
        {showGu ? t('lesson.hideTranslation') : t('lesson.showTranslation')}
      </Btn>
      <ul className="mt-4 grid gap-3">
        {lines.map((line, i) => {
          const right = speakers.indexOf(line.speaker) % 2 === 1;
          return (
            <li
              key={i}
              className={`flex items-start gap-3 ${right ? 'flex-row-reverse sm:pl-10' : 'sm:pr-10'}`}
            >
              <AudioButton text={line.de} />
              <div
                className={`min-w-0 rounded-2xl px-4 py-3 ${
                  right
                    ? 'rounded-tr-md bg-brand-soft'
                    : 'rounded-tl-md border border-line bg-surface shadow-soft'
                }`}
              >
                <p className="text-xs font-bold tracking-wide text-brand" lang="de">
                  {line.speaker}
                </p>
                <p lang="de" className="text-lg">
                  {line.de}
                </p>
                {showGu && <p className="text-muted">{line.gu}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
