// 通用 DOM 工具与 Discourse 弹窗选择器（中文注释）

export function closestAny(el: Element | null, selectors: string[]): Element | null {
  if (!el) return null;
  for (const sel of selectors) {
    const hit = el.closest?.(sel);
    if (hit) return hit;
  }
  return null;
}

const USER_CARD_SELECTORS = ['#user-card', '.user-card', '.user-card-container'];
const USER_MENU_SELECTORS = ['#user-menu', '.user-menu', '.user-menu-panel', '.quick-access-panel', '.menu-panel'];
const HEADER_SELECTORS = ['header', '.d-header', '#site-header'];
const USER_MENU_NAV_SELECTORS = [
  '.user-menu .navigation',
  '.user-menu [role="tablist"]',
  '.user-menu .menu-tabs',
  '.user-menu .categories',
  '#user-menu .navigation',
];

export function isInUserCard(el: Element | null): boolean {
  return !!closestAny(el as Element, USER_CARD_SELECTORS);
}

export function isInUserMenu(el: Element | null): boolean {
  return !!closestAny(el as Element, USER_MENU_SELECTORS);
}

export function isInHeader(el: Element | null): boolean {
  return !!closestAny(el as Element, HEADER_SELECTORS);
}

export function isInUserMenuNav(el: Element | null): boolean {
  return !!closestAny(el as Element, USER_MENU_NAV_SELECTORS);
}

// 侧边栏（左侧分类导航等）常见选择器集合
// 说明：不同 Discourse 站点可能存在定制，以下选择器取常见命名，必要时可扩展
const SIDEBAR_SELECTORS = [
  '#sidebar',
  '.sidebar',
  '.d-sidebar',
  '.sidebar-container',
  '.discourse-sidebar',
  '.sidebar-section',
  '.sidebar-wrapper',
];

export function isInSidebar(el: Element | null): boolean {
  return !!closestAny(el as Element, SIDEBAR_SELECTORS);
}

// 触发“用户卡片”的典型 <a>：通常带有 data-user-card 属性或特定类名
export function isUserCardTrigger(a: HTMLAnchorElement): boolean {
  if (!a) return false;
  if (a.hasAttribute('data-user-card')) return true;
  const cls = (a.className || '').toString().toLowerCase();
  if (/user-card|avatar|trigger-user-card/.test(cls) && a.pathname?.toLowerCase?.().startsWith('/u/')) {
    return true;
  }
  return false;
}

// 触发“用户菜单”的典型 <a>：位于页头，并具备下拉/菜单相关属性或类名
export function isUserMenuTrigger(a: HTMLAnchorElement): boolean {
  if (!a) return false;
  if (!isInHeader(a)) return false;
  if (a.hasAttribute('aria-haspopup') || a.hasAttribute('aria-expanded')) return true;
  const cls = (a.className || '').toString().toLowerCase();
  if (/current-user|header-dropdown-toggle|user-menu|avatar/.test(cls)) return true;
  return false;
}

export function isActiveTab(a: HTMLAnchorElement): boolean {
  if (!a) return false;
  if (a.getAttribute('aria-selected') === 'true') return true;
  const cls = (a.className || '').toString().toLowerCase();
  return /active|selected/.test(cls);
}

