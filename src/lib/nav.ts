import type { UiKey } from './t';

export interface NavItem {
  href: string;
  key: UiKey;
  icon:
    'home' | 'book' | 'cards' | 'chart' | 'gear' | 'mic' | 'clipboard' | 'list' | 'search' | 'bulb';
}

// Shown in the phone bottom bar and at the top of the desktop side nav
export const primaryNav: NavItem[] = [
  { href: '/', key: 'nav.home', icon: 'home' },
  { href: '/chapters/', key: 'nav.chapters', icon: 'book' },
  { href: '/review/', key: 'nav.review', icon: 'cards' },
  { href: '/progress/', key: 'nav.progress', icon: 'chart' },
  { href: '/settings/', key: 'nav.settings', icon: 'gear' },
];

// Reachable from the home page on phones and from the desktop side nav
export const secondaryNav: NavItem[] = [
  { href: '/pronunciation/', key: 'nav.pronunciation', icon: 'mic' },
  { href: '/exam/', key: 'nav.exams', icon: 'clipboard' },
  { href: '/glossary/', key: 'nav.glossary', icon: 'list' },
  { href: '/search/', key: 'nav.search', icon: 'search' },
  { href: '/how-to-study/', key: 'nav.howToStudy', icon: 'bulb' },
];

export function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}
