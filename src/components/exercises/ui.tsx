import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { t } from '../../lib/t';

const variants = {
  primary: 'bg-brand text-brand-fg hover:opacity-90',
  secondary: 'bg-surface-2 text-fg border border-line hover:bg-brand-soft',
  ghost: 'text-brand hover:bg-brand-soft',
};

export function Btn({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}

export function CheckButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <Btn className="mt-4" disabled={disabled} onClick={onClick}>
      {t('words.checkAnswer')}
    </Btn>
  );
}

/** Class for a tappable answer choice. */
export function optionClass(selected: boolean): string {
  return `min-h-11 rounded-lg border px-4 py-2 text-left font-semibold transition disabled:cursor-default ${
    selected ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface hover:border-brand'
  }`;
}

const umlauts = ['ä', 'ö', 'ü', 'ß'];

/** Text input for German answers, with ä ö ü ß buttons for keyboards that lack them. */
export function GermanInput({
  value,
  onChange,
  onEnter,
  disabled,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
  disabled?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <div>
      <input
        lang="de"
        type="text"
        value={value}
        disabled={disabled}
        placeholder={t('practice.typeHere')}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        className="min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2 text-lg"
        {...rest}
      />
      {!disabled && (
        <div className="mt-2 flex gap-2" lang="de">
          {umlauts.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => onChange(value + ch)}
              className="size-11 rounded-lg border border-line bg-surface-2 text-lg font-semibold hover:bg-brand-soft"
            >
              {ch}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
