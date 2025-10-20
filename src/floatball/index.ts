// 悬浮球组件（中文注释）
// 职责：
// - 显示/隐藏：跟随设置实时切换
// - 点击：在允许的模式集合中循环切换 open:bg-mode（无→仅主题帖→全部）
// - 拖动：更新位置（以视口百分比存储）；拖动阈值避免误触点击
// - 固定：关闭拖动
// - 主题：跟随设置面板的主题(light/dark/auto)，自动适配
// - 窗口尺寸变化：按比例重新定位并确保可见

import { getBackgroundOpenMode, setBackgroundOpenMode, type BackgroundOpenMode } from '../storage/openMode';
import {
  getFloatBallEnabled,
  setFloatBallEnabled,
  getFloatBallFixed,
  setFloatBallFixed,
  getFloatBallPos,
  setFloatBallPos,
  resetFloatBallPos,
  getAllowedModes,
  setAllowedModes,
  type AllowedModes,
} from '../storage/floatBall';
import { gmGet } from '../storage/gm';
import { gmOnValueChange } from '../storage/gm';
import type { FloatBallPos } from '../storage/floatBall';
import { __keys as FB_KEYS } from '../storage/floatBall';
import { t } from '../ui/i18n';
import { logBgBallVisibility, logBgModeChange, logError } from '../debug/logger';

// DOM 状态
let rootEl: HTMLDivElement | null = null;
let iconEl: HTMLDivElement | null = null;
let tipEl: HTMLDivElement | null = null;
let dragging = false;
let dragStart: { x: number; y: number; left: number; top: number } | null = null;
let fixed = false;
let allowed: AllowedModes = { none: true, topic: true, all: true };
let curMode: BackgroundOpenMode = 'none';
let unsubPos: (() => void) | null = null;
let rafId: number | null = null;

// 拖动与点击判定阈值（像素）
const DRAG_THRESHOLD = 5;
// 直径与边距（像素）
const SIZE = 44;
const MARGIN = 8;

// 图标（简易占位，后续可由 UI 优化）
const Icons: Record<BackgroundOpenMode, string> = {
  none: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8" /></svg>`,
  topic: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h10M4 17h16"/></svg>`,
  all: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>`,
};

// 颜色：不同模式不同主色；light/dark 通过 class 切换基色
const ModeColor: Record<BackgroundOpenMode, string> = {
  none: '#909399',
  topic: '#409eff',
  all: '#67c23a',
};

function ensureStyle() {
  if (document.getElementById('dnt-fb-style')) return;
  const s = document.createElement('style');
  s.id = 'dnt-fb-style';
  s.textContent = `
  .dnt-fb {
    position: fixed;
    z-index: 2147483646;
    width: ${SIZE}px;
    height: ${SIZE}px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px) saturate(150%);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
    will-change: transform;
  }
  .dnt-fb-dark {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 2px 10px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.15);
  }
  .dnt-fb:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2), 0 3px 10px rgba(0, 0, 0, 0.12);
  }
  .dnt-fb-dark:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5), 0 3px 12px rgba(0, 0, 0, 0.35);
  }
  .dnt-fb-dragging {
    transform: scale(1.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: grabbing !important;
  }
  .dnt-fb-dark.dnt-fb-dragging {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.6), 0 4px 14px rgba(0, 0, 0, 0.4);
  }
  .dnt-fb-fixed {
    cursor: default;
  }
  .dnt-fb-fixed:hover {
    transform: scale(1.02);
  }
  .dnt-fb-drag-handle {
    position: absolute;
    top: 4px;
    width: 16px;
    height: 3px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 2px;
    opacity: 0.6;
  }
  .dnt-fb-fixed .dnt-fb-drag-handle {
    display: none;
  }
  .dnt-fb-icon {
    color: #fff;
    line-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dnt-fb-tip {
    position: absolute;
    bottom: ${SIZE + 8}px;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 500;
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    pointer-events: none;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  .dnt-fb:hover .dnt-fb-tip {
    opacity: 1;
    transform: translateY(0);
  }
  .dnt-fb-dragging .dnt-fb-tip {
    display: none;
  }
  `;
  document.head.appendChild(s);
}

function getThemeClass(): 'dnt-fb-light' | 'dnt-fb-dark' {
  // 直接读取 UI 主题设置；若为 auto 则根据系统偏好
  const theme = (window as any).__dntThemeCache as 'light'|'dark'|'auto' | undefined;
  const fallback = theme ?? (function() { try { return (localStorage.getItem('dnt:ui-theme')?.replace(/"/g,'') as any) || 'auto'; } catch { return 'auto'; } })();
  if (fallback === 'dark') return 'dnt-fb-dark';
  if (fallback === 'auto') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dnt-fb-dark' : 'dnt-fb-light';
  }
  return 'dnt-fb-light';
}

function pxLeftFromRatio(xRatio: number): number {
  const vw = window.innerWidth;
  const left = Math.round(vw * xRatio - SIZE / 2);
  return clamp(left, MARGIN, vw - SIZE - MARGIN);
}
function pxTopFromRatio(yRatio: number): number {
  const vh = window.innerHeight;
  const top = Math.round(vh * yRatio - SIZE / 2);
  return clamp(top, MARGIN, vh - SIZE - MARGIN);
}
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function setElPosFromRatio(el: HTMLElement, pos: { xRatio: number; yRatio: number }) {
  el.style.left = pxLeftFromRatio(pos.xRatio) + 'px';
  el.style.top = pxTopFromRatio(pos.yRatio) + 'px';
}

function getTipText(mode: BackgroundOpenMode): string {
  const map: Record<BackgroundOpenMode, string> = {
    none: `后台打开: ${t('settings.openMode.options.none')}`,
    topic: `后台打开: ${t('settings.openMode.options.topic')}`,
    all: `后台打开: ${t('settings.openMode.options.all')}`,
  };
  return map[mode] || '';
}

function applyModeVisual() {
  if (!rootEl || !iconEl) return;
  const color = ModeColor[curMode];
  rootEl.style.background = color;
  iconEl.innerHTML = Icons[curMode];
  const tip = getTipText(curMode);
  rootEl.title = tip;
  if (tipEl) tipEl.textContent = tip;
}

async function cycleMode() {
  const order: BackgroundOpenMode[] = ['none', 'topic', 'all'];
  const enabledModes = order.filter((m) => allowed[m]);
  if (enabledModes.length < 2) {
    // 兜底：若异常为 1 项，自动补上 'all'
    if (!allowed.all) { allowed.all = true; await setAllowedModes(allowed); }
    enabledModes.push('all');
  }
  const idx = enabledModes.indexOf(curMode);
  const next = enabledModes[(idx + 1) % enabledModes.length];
  if (next !== curMode) {
    curMode = next;
    await setBackgroundOpenMode(curMode);
    applyModeVisual();
    await logBgModeChange(curMode, 'ball');
  }
}

function onMouseDown(ev: MouseEvent) {
  if (!rootEl) return;
  // 固定状态下记录按下起点用于点击判定，但不进入拖拽
  dragging = !fixed;
  const rect = rootEl.getBoundingClientRect();
  dragStart = { x: ev.clientX, y: ev.clientY, left: rect.left, top: rect.top };

  if (dragging) {
    rootEl.classList.add('dnt-fb-dragging');
    rootEl.style.cursor = 'grabbing';
  }
}

function onMouseMove(ev: MouseEvent) {
  if (!rootEl || !dragging || !dragStart) return;

  // 使用 requestAnimationFrame 优化性能，确保流畅拖动
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }

  rafId = requestAnimationFrame(() => {
    if (!rootEl || !dragStart) return;

    const dx = ev.clientX - dragStart.x;
    const dy = ev.clientY - dragStart.y;

    // 移动过程中立即更新像素位置（鼠标到哪，悬浮球就到哪）
    const left = clamp(dragStart.left + dx, MARGIN, window.innerWidth - SIZE - MARGIN);
    const top = clamp(dragStart.top + dy, MARGIN, window.innerHeight - SIZE - MARGIN);

    rootEl.style.left = `${left}px`;
    rootEl.style.top = `${top}px`;

    rafId = null;
  });
}

async function onMouseUp(ev: MouseEvent) {
  if (!rootEl) return;
  if (!dragStart) return;

  // 清理可能残留的 RAF
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  rootEl.classList.remove('dnt-fb-dragging');
  rootEl.style.cursor = fixed ? 'default' : 'pointer';

  const dx = Math.abs(ev.clientX - dragStart.x);
  const dy = Math.abs(ev.clientY - dragStart.y);
  const wasDragging = dragging && (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD);

  dragging = false;

  if (wasDragging) {
    const rect = rootEl.getBoundingClientRect();
    // 保存为视口比例
    const xRatio = (rect.left + SIZE / 2) / window.innerWidth;
    const yRatio = (rect.top + SIZE / 2) / window.innerHeight;
    await setFloatBallPos({ xRatio, yRatio });
  }

  dragStart = null;

  if (!wasDragging) {
    // 作为点击处理（避免与拖动混淆）
    await cycleMode();
  }
}

function onWindowResize() {
  if (!rootEl) return;
  // 依据存储的比例重新定位
  getFloatBallPos().then((pos) => setElPosFromRatio(rootEl!, pos)).catch((e) => void logError('bg', '窗口变化定位失败', e));
}

function updateThemeClass() {
  if (!rootEl) return;
  rootEl.classList.remove('dnt-fb-light', 'dnt-fb-dark');
  rootEl.classList.add(getThemeClass());
}

function observeTheme() {
  // 监听 <html data-dnt-theme> 变化；同时监听系统主题变化
  const mo = new MutationObserver(() => updateThemeClass());
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-dnt-theme'] });
  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => updateThemeClass());
    } catch {
      // 某些浏览器不支持 addEventListener（无需日志）
    }
  }
}

function createRoot(): HTMLDivElement {
  const el = document.createElement('div');
  el.id = 'dnt-float-ball';
  el.className = `dnt-fb ${getThemeClass()}`;
  el.setAttribute('aria-label', '后台打开切换');

  // 拖动手柄
  const dragHandle = document.createElement('div');
  dragHandle.className = 'dnt-fb-drag-handle';
  el.appendChild(dragHandle);

  const icon = document.createElement('div');
  icon.className = 'dnt-fb-icon';
  el.appendChild(icon);

  const tip = document.createElement('div');
  tip.className = 'dnt-fb-tip';
  tip.textContent = '';
  el.appendChild(tip);

  // 拖拽与点击
  el.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  return el;
}

async function mount() {
  if (rootEl) return;
  await ensureDomReady();
  ensureStyle();
  curMode = await getBackgroundOpenMode();
  fixed = await getFloatBallFixed();
  allowed = await getAllowedModes();

  rootEl = createRoot();
  iconEl = rootEl.querySelector('.dnt-fb-icon');
  tipEl = rootEl.querySelector('.dnt-fb-tip');
  applyModeVisual();
  if (fixed) rootEl.classList.add('dnt-fb-fixed');

  const pos = await getFloatBallPos();
  setElPosFromRatio(rootEl, pos);
  if (document.body) document.body.appendChild(rootEl);

  observeTheme();
  window.addEventListener('resize', onWindowResize);
  // 跨页面同步位置变化
  if (unsubPos) { try { unsubPos(); } catch {} ; unsubPos = null; }
  unsubPos = gmOnValueChange<FloatBallPos>(FB_KEYS.KEY_FB_POS, (_oldV, newV) => {
    if (!rootEl || !newV) return;
    setElPosFromRatio(rootEl, newV);
  });
  await logBgBallVisibility(true);
}

async function unmount() {
  if (!rootEl) return;
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  if (unsubPos) { try { unsubPos(); } catch {} ; unsubPos = null; }
  rootEl.remove();
  rootEl = null;
  iconEl = null;
  await logBgBallVisibility(false);
}

export async function initFloatBall() {
  const enabled = await getFloatBallEnabled();
  if (enabled) await mount();
}

// 供设置界面实时联动调用
export async function setFloatBallShown(on: boolean) {
  await setFloatBallEnabled(on);
  if (on) await mount(); else await unmount();
}

export async function setFloatBallFixedMode(on: boolean) {
  fixed = on;
  await setFloatBallFixed(on);
  if (rootEl) {
    if (on) rootEl.classList.add('dnt-fb-fixed');
    else rootEl.classList.remove('dnt-fb-fixed');
  }
}

export async function resetFloatBallPosition() {
  const pos = await resetFloatBallPos();
  if (rootEl) setElPosFromRatio(rootEl, pos);
}

export async function updateAllowedModes(next: AllowedModes) {
  allowed = await setAllowedModes(next);
}

export async function syncCurrentModeFromStorage() {
  curMode = await getBackgroundOpenMode();
  applyModeVisual();
}

// 供外部用于调试或 API 使用
export const __floatBall = {
  get state() { return { mounted: !!rootEl, fixed, allowed, mode: curMode }; },
};

// 等待 DOM 就绪（确保 head 与 body 可用）
async function ensureDomReady(): Promise<void> {
  if (document.head && document.body && document.readyState !== 'loading') return;
  await new Promise<void>((resolve) => {
    const check = () => {
      if (document.head && document.body && document.readyState !== 'loading') {
        document.removeEventListener('DOMContentLoaded', check);
        document.removeEventListener('readystatechange', check);
        resolve();
      }
    };
    document.addEventListener('DOMContentLoaded', check, { once: true });
    document.addEventListener('readystatechange', check);
    // 兜底：定时检查（极端场景）
    const timer = setInterval(() => {
      if (document.head && document.body && document.readyState !== 'loading') {
        clearInterval(timer);
        check();
      }
    }, 30);
  });
}
