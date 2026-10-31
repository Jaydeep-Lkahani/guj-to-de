import { useRef, useState, type ReactNode } from 'react';
import { exportProgress, importProgress, ProgressError } from '../lib/progress-schema';
import { localDate } from '../lib/progress-logic';
import { replaceProgress, resetProgress, updateProgress } from '../lib/progress-store';
import { t } from '../lib/t';
import AudioControls from './AudioControls';
import { Btn } from './exercises/ui';
import { useProgress } from './use-progress';

function Toggle({
  checked,
  onChange,
  label,
  help,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  help: string;
}) {
  return (
    <label className="flex min-h-11 items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-5 shrink-0 accent-[var(--brand)]"
      />
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-sm text-muted">{help}</span>
      </span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="section-title mb-4">{title}</h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

const field = 'min-h-11 w-full max-w-xs rounded-xl border-2 border-line bg-bg px-3 py-2 text-lg';

export default function SettingsView() {
  const { data, ready, canSave } = useProgress();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean }>();
  const [goalDraft, setGoalDraft] = useState<string>();

  if (!ready) return <div className="h-96" aria-hidden="true" />;
  const { settings } = data;
  const set = (change: Partial<typeof settings>) =>
    updateProgress((d) => ({ ...d, settings: { ...d.settings, ...change } }));

  const download = () => {
    const blob = new Blob([exportProgress(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guj-de-progress-${localDate()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imported = importProgress(await file.text());
      if (!window.confirm(t('settingsPage.importConfirm'))) return;
      replaceProgress(imported);
      setMessage({ text: t('settingsPage.importOk'), ok: true });
    } catch (e) {
      const detail = e instanceof ProgressError ? e.message : String(e);
      setMessage({ text: `${t('settingsPage.importBad')}: ${detail}`, ok: false });
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const onReset = () => {
    if (!window.confirm(t('settingsPage.resetConfirm'))) return;
    resetProgress();
    setMessage({ text: t('settingsPage.resetDone'), ok: true });
  };

  return (
    <div className="flex flex-col gap-6">
      {!canSave && (
        <div role="alert" className="rounded-xl border-l-4 border-warn bg-warn-soft p-4">
          {t('settingsPage.cannotSave')}
        </div>
      )}

      <Section title={t('settingsPage.general')}>
        <div>
          <label htmlFor="exam-date" className="mb-1 block font-semibold">
            {t('settingsPage.examDate')}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="exam-date"
              type="date"
              value={settings.examDate ?? ''}
              onChange={(e) => set({ examDate: e.target.value || null })}
              className={field}
            />
            {settings.examDate && (
              <Btn variant="ghost" onClick={() => set({ examDate: null })}>
                {t('settingsPage.clearDate')}
              </Btn>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">{t('settingsPage.examDateHelp')}</p>
        </div>

        <div>
          <label htmlFor="daily-goal" className="mb-1 block font-semibold">
            {t('settingsPage.dailyGoal')}
          </label>
          <input
            id="daily-goal"
            type="number"
            inputMode="numeric"
            min={1}
            max={1440}
            value={goalDraft ?? settings.dailyGoalMinutes}
            onChange={(e) => {
              setGoalDraft(e.target.value);
              const n = Number(e.target.value);
              if (Number.isInteger(n) && n >= 1 && n <= 1440) set({ dailyGoalMinutes: n });
            }}
            onBlur={() => setGoalDraft(undefined)}
            className={field}
          />
        </div>

        <Toggle
          checked={settings.pronHelper}
          onChange={(pronHelper) => set({ pronHelper })}
          label={t('settingsPage.pronHelper')}
          help={t('settingsPage.pronHelp')}
        />
        <AudioControls />
      </Section>

      <Section title={t('settingsPage.backup')}>
        <p className="text-sm text-muted">{t('settingsPage.backupHelp')}</p>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={download}>{t('settingsPage.export')}</Btn>
          <Btn variant="secondary" onClick={() => fileInput.current?.click()}>
            {t('settingsPage.import')}
          </Btn>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label={t('settingsPage.import')}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
        {message && (
          <p
            role="status"
            className={message.ok ? 'font-semibold text-ok' : 'font-semibold text-bad'}
          >
            {message.text}
          </p>
        )}
      </Section>

      <Section title={t('settingsPage.danger')}>
        <div>
          <Btn variant="secondary" className="text-bad" onClick={onReset}>
            {t('settingsPage.reset')}
          </Btn>
        </div>
      </Section>
    </div>
  );
}
