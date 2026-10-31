import ui from '../content-shared/ui-gu.json';

type Paths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];

export type UiKey = Paths<typeof ui>;

/** Look up a Gujarati UI string by dotted key, e.g. t('nav.home'). Unknown keys fail the type check. */
export function t(key: UiKey): string {
  let node: unknown = ui;
  for (const part of key.split('.')) {
    node = (node as Record<string, unknown>)[part];
  }
  if (typeof node !== 'string') throw new Error(`Missing UI string: ${key}`);
  return node;
}
