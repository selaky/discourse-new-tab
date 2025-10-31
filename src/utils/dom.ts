// 通用 DOM 工具与 Discourse 弹窗选择器（中文注释）
import { logError } from '../debug/logger';

export function closestAny(el: Element | null, selectors: string[]): Element | null {
  if (!el) return null;
  for (const sel of selectors) {
    const hit = el.closest?.(sel);
    if (hit) return hit;
  }
  return null;
}

const USER_CARD_SELECTORS = ['#user-card', '.user-card', '.user-card-container'];
// 用户菜单选择器：需限定在 user-menu 容器内，避免将“搜索框弹窗（search quick-access）”误判为用户菜单
// 说明：Discourse 的搜索与用户菜单都可能包含 `.quick-access-panel` / `.menu-panel`，
// 若直接匹配这些通用类会导致搜索弹窗被识别为用户菜单。
// 因此，这里仅匹配带有 `#user-menu`/`.user-menu` 容器作用域下的面板。
const USER_MENU_SELECTORS = [
  '#user-menu',
  '.user-menu',
  '.user-menu-panel',
  '#user-menu .quick-access-panel',
  '.user-menu .quick-access-panel',
  '#user-menu .menu-panel',
  '.user-menu .menu-panel',
];
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

// —— 搜索弹窗（Search Menu）——
// 说明：为避免与用户菜单选择器混淆，这里单独提供搜索相关的判定函数。
// 结构在不同版本/主题中略有差异，以下选择器尽量覆盖核心容器与结果区。

// 搜索弹窗主体容器（尽量精确，优先 ID，再到常见类名）
const SEARCH_MENU_SELECTORS = [
  '#search-menu',
  '.search-menu',
  '.header .search-menu',
  '.d-header .search-menu',
];

// 搜索“结果列表”区域（排除历史/建议区）。不同版本可能命名不同，这里取常见候选。
const SEARCH_RESULTS_SELECTORS = [
  '#search-menu .results',
  '.search-menu .results',
  '#search-menu .search-results',
  '.search-menu .search-results',
  '.quick-access-panel .results',
  '.menu-panel .results',
  '.menu-panel .search-results',
];

export function isInSearchMenu(el: Element | null): boolean {
  return !!closestAny(el as Element, SEARCH_MENU_SELECTORS);
}

export function isInSearchResults(el: Element | null): boolean {
  if (!isInSearchMenu(el)) return false;
  return !!closestAny(el as Element, SEARCH_RESULTS_SELECTORS);
}

// 仅匹配“主题帖结果项”的链接：在结果区内且 URL 路径包含 /t/
export function isSearchResultTopicLink(a: HTMLAnchorElement): boolean {
  if (!a) return false;
  if (!isInSearchResults(a)) return false;
  try {
    const href = a.getAttribute('href') || a.href || '';
    // 相对链接也可被浏览器补全为绝对；容错处理 pathname 提取
    const url = new URL(href, location.href);
    return /\/t\//.test(url.pathname || '');
  } catch (err) {
    void logError('link', '解析搜索结果链接失败', err);
    return false;
  }
}

// “更多（更多结果）”按钮：通常指向 /search?q=...，但需限定在结果区以避免命中历史/建议
export function isSearchResultMoreLink(a: HTMLAnchorElement): boolean {
  if (!a) return false;
  if (!isInSearchResults(a)) return false;
  try {
    const href = a.getAttribute('href') || a.href || '';
    const url = new URL(href, location.href);
    if (!/\/search/.test(url.pathname || '')) return false;
    // 底部更多通常位于结果区尾部，进一步弱校验：类名/文本提示（尽量不依赖具体语言）
    const cls = (a.className || '').toString().toLowerCase();
    if (/more|show-more|load-more|see-more/.test(cls)) return true;
    const text = (a.textContent || '').trim().toLowerCase();
    if (/more|show more|更多|更多结果/.test(text)) return true;
    // 若无明显线索，也允许在结果区内的 /search 链接作为“更多”处理
    return true;
  } catch (err) {
    void logError('link', '解析搜索结果“更多”链接失败', err);
    return false;
  }
}

// 从搜索结果项推断可导航的 URL：
// - 优先读取元素及其近邻容器上的 data-url / data-topic-url
// - 退化为 data-topic-id → "/t/<id>"
// - 若容器内存在可见 a[href]，取其 href
export function resolveSearchResultLink(a: HTMLAnchorElement): string | null {
  if (!a) return null;
  if (!isInSearchResults(a)) return null;

  const attrNames = ['data-url', 'data-href', 'data-link', 'data-topic-url'];

  const readAttrs = (el: Element | null): string | null => {
    if (!el) return null;
    for (const k of attrNames) {
      const v = el.getAttribute?.(k);
      if (v) return v;
    }
    // 以 topic id 拼 URL（Discourse 允许 /t/<id> 直接跳转）
    const topicId = el.getAttribute?.('data-topic-id') || el.getAttribute?.('data-topicid');
    if (topicId && /\d+/.test(topicId)) return `/t/${topicId}`;
    return null;
  };

  // 1) 自身/父级若带有 data-url 等
  let node: Element | null = a as Element;
  for (let i = 0; i < 4 && node; i++) {
    const v = readAttrs(node);
    if (v) return v;
    node = node.parentElement;
  }

  // 2) 结果项容器内查找 a[href]
  const container = (a.closest?.('.search-link, .search-result, .fps-result, li, article, .search-row') || a.parentElement) as Element | null;
  if (container) {
    const inner = container.querySelector?.('a[href]') as HTMLAnchorElement | null;
    if (inner && inner.getAttribute('href')) return inner.getAttribute('href');
    const v = readAttrs(container);
    if (v) return v;
  }

  return null;
}


// —— 聊天（Chat）——
// 识别聊天触发与聊天链接：
// - 头部聊天按钮：位于 Header，父级 li 或自身类名通常包含 chat-header-icon，或包含 d-chat 图标
// - 任意指向 /chat 或 /chat/... 的链接
export function isChatHeaderTrigger(a: HTMLAnchorElement): boolean {
  if (!a) return false;
  if (!isInHeader(a)) return false;
  const li = a.closest?.('li');
  const cls = `${(a.className || '').toString()} ${(li?.className || '').toString()}`.toLowerCase();
  if (cls.includes('chat-header-icon')) return true;
  // 图标/标题文案线索
  const hasIcon = !!a.querySelector?.('.d-icon-d-chat, .d-icon.d-icon-d-chat, svg.d-icon-d-chat');
  if (hasIcon) return true;
  const title = (a.getAttribute('title') || '').toLowerCase();
  if (/\bchat\b|聊天/.test(title)) return true;
  // href 提示
  try {
    const href = a.getAttribute('href') || a.href || '';
    const url = new URL(href, location.href);
    if (url.pathname === '/chat' || url.pathname.startsWith('/chat/')) return true;
  } catch (err) {
    void logError('link', '解析聊天触发链接失败', err);
  }
  return false;
}

export function isChatLink(a: HTMLAnchorElement): boolean {
  if (!a) return false;
  try {
    const href = a.getAttribute('href') || a.href || '';
    const url = new URL(href, location.href);
    return url.pathname === '/chat' || url.pathname.startsWith('/chat/');
  } catch (err) {
    void logError('link', '解析聊天链接失败', err);
    return false;
  }
}

