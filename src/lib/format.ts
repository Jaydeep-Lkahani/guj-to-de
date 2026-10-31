import { t } from './t';

/** 80 → "1 કલાક 20 મિનિટ", 45 → "45 મિનિટ", 120 → "2 કલાક". */
export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes} ${t('dashboard.min')}`;
  if (minutes === 0) return `${hours} ${t('dashboard.hour')}`;
  return `${hours} ${t('dashboard.hour')} ${minutes} ${t('dashboard.min')}`;
}
