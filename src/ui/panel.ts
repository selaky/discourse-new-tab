// 设置面板UI构建
import { closeSettings } from './settings';
import { getTheme, toggleTheme, ThemeIcon } from './theme';
import { getLanguage, toggleLanguage, LanguageIcon } from './i18n';
import { t } from './i18n';
import { renderStatusSection } from './sections/status';
import { renderDomainSection } from './sections/domain';
import { renderRulesSection } from './sections/rules';

export function createSettingsPanel(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'dnt-settings-overlay';
  overlay.className = 'dnt-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'dnt-dialog';

  // 头部
  const header = createHeader();
  dialog.appendChild(header);

  // 内容区
  const content = document.createElement('div');
  content.className = 'dnt-content';

  // 状态区域
  content.appendChild(renderStatusSection());

  // 论坛识别区域
  content.appendChild(renderDomainSection());

  // 跳转规则区域
  content.appendChild(renderRulesSection());

  dialog.appendChild(content);

  overlay.appendChild(dialog);

  // 点击遮罩关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeSettings();
    }
  });

  return overlay;
}

function createHeader(): HTMLElement {
  const header = document.createElement('div');
  header.className = 'dnt-header';

  // 标题
  const title = document.createElement('h2');
  title.className = 'dnt-title';
  title.textContent = t('settings.title');
  header.appendChild(title);

  // 右侧控制区
  const controls = document.createElement('div');
  controls.className = 'dnt-controls';

  // 主题切换按钮
  const themeBtn = document.createElement('button');
  themeBtn.className = 'dnt-icon-btn';
  themeBtn.title = t(`settings.theme.${getTheme()}`);
  themeBtn.innerHTML = ThemeIcon[getTheme()];
  themeBtn.addEventListener('click', () => {
    toggleTheme();
    themeBtn.innerHTML = ThemeIcon[getTheme()];
    themeBtn.title = t(`settings.theme.${getTheme()}`);
  });
  controls.appendChild(themeBtn);

  // 语言切换按钮
  const langBtn = document.createElement('button');
  langBtn.className = 'dnt-icon-btn';
  langBtn.title = t(`settings.language.${getLanguage()}`);
  langBtn.innerHTML = LanguageIcon[getLanguage()];
  langBtn.addEventListener('click', () => {
    toggleLanguage();
    langBtn.innerHTML = LanguageIcon[getLanguage()];
    // 刷新整个面板以更新所有文本
    closeSettings();
    const { openSettings } = require('./settings');
    openSettings();
  });
  controls.appendChild(langBtn);

  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.className = 'dnt-icon-btn';
  closeBtn.title = t('settings.close');
  closeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`;
  closeBtn.addEventListener('click', closeSettings);
  controls.appendChild(closeBtn);

  header.appendChild(controls);

  return header;
}
