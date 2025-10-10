// 设置界面主模块
import { createSettingsPanel } from './panel';
import { initTheme } from './theme';
import { initI18n } from './i18n';
import { injectStyles } from './inject-styles';

export async function openSettings() {
  // 注入样式
  injectStyles();

  // 初始化主题和语言
  await initTheme();
  await initI18n();

  // 创建并显示设置面板
  const panel = createSettingsPanel();
  document.body.appendChild(panel);
}

export function closeSettings() {
  const existing = document.getElementById('dnt-settings-overlay');
  if (existing) {
    existing.remove();
  }
}
