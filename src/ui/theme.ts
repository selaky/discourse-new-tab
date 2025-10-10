// 主题管理：日间/夜间/自动
import { gmGet, gmSet } from '../storage/gm';

export type Theme = 'light' | 'dark' | 'auto';

const KEY_THEME = 'ui-theme';
const THEMES: Theme[] = ['light', 'dark', 'auto'];

// SVG 图标
export const ThemeIcon: Record<Theme, string> = {
  light: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>`,
  dark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>`,
  auto: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2 A 10 10 0 0 1 12 22 Z" fill="currentColor"></path>
  </svg>`,
};

let currentTheme: Theme = 'auto';

export async function initTheme() {
  currentTheme = (await gmGet<Theme>(KEY_THEME)) || 'auto';
  applyTheme();
}

export function getTheme(): Theme {
  return currentTheme;
}

export async function setTheme(theme: Theme) {
  currentTheme = theme;
  await gmSet(KEY_THEME, theme);
  applyTheme();
}

export async function toggleTheme() {
  const idx = THEMES.indexOf(currentTheme);
  const next = THEMES[(idx + 1) % THEMES.length];
  await setTheme(next);
}

function applyTheme() {
  const root = document.documentElement;

  if (currentTheme === 'auto') {
    // 根据系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-dnt-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-dnt-theme', currentTheme);
  }
}

// 监听系统主题变化
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'auto') {
      applyTheme();
    }
  });
}
