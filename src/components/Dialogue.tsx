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
  return (
    <div>
      <Btn variant="secondary" aria-pressed={showGu} onClick={() => setShowGu(!showGu)}>
        {showGu ? t('lesson.hideTranslation') : t('lesson.showTranslation')}
      </Btn>
      <ul className="mt-3 grid gap-3">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-3">
            <AudioButton text={line.de} />
            <div>
              <p className="text-sm font-semibold text-muted" lang="de">
                {line.speaker}
              </p>
              <p lang="de" className="text-lg">
                {line.de}
              </p>
              {showGu && <p className="text-muted">{line.gu}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
