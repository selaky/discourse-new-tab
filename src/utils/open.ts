// 打开新标签页相关工具
import { logError } from '../debug/logger';

export function openNewTabForeground(url: string) {
  try {
    // 与现有实现保持一致，避免 opener 泄露
    window.open(url, '_blank', 'noopener');
  } catch (err) {
    void logError('final', 'window.open 失败，降级为 location.href', err);
    try { location.href = url; } catch (e2) { void logError('final', 'location.href 跳转失败', e2); }
  }
}

export function openNewTabBackground(url: string) {
  try {
    const GM: any = (globalThis as any).GM;
    if (GM?.openInTab) {
      GM.openInTab(url, { active: false, setParent: true });
      return;
    }
  } catch (err) { void logError('final', 'GM.openInTab 调用失败', err); }
  try {
    const gmo: any = (globalThis as any).GM_openInTab;
    if (typeof gmo === 'function') {
      gmo(url, { active: false, setParent: true });
      return;
    }
  } catch (err) { void logError('final', 'GM_openInTab 调用失败', err); }
  // 降级：无法后台打开时，仍然用前台新标签页，保持功能可用
  openNewTabForeground(url);
}
