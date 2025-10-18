// 打开新标签页相关工具

export function openNewTabForeground(url: string) {
  try {
    // 与现有实现保持一致，避免 opener 泄露
    window.open(url, '_blank', 'noopener');
  } catch {
    try { location.href = url; } catch {}
  }
}

export function openNewTabBackground(url: string) {
  try {
    const GM: any = (globalThis as any).GM;
    if (GM?.openInTab) {
      GM.openInTab(url, { active: false, setParent: true });
      return;
    }
  } catch {}
  try {
    const gmo: any = (globalThis as any).GM_openInTab;
    if (typeof gmo === 'function') {
      gmo(url, { active: false, setParent: true });
      return;
    }
  } catch {}
  // 降级：无法后台打开时，仍然用前台新标签页，保持功能可用
  openNewTabForeground(url);
}

