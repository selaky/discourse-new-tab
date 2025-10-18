// 设置面板UI构建 - 分类布局
import { closeSettings } from './settings';
import { getTheme, toggleTheme, ThemeIcon } from './theme';
import { getLanguage, toggleLanguage, LanguageIcon } from './i18n';
import { t } from './i18n';
import { CATEGORIES, type CategoryId } from './sections/categories';
import { renderRecognitionCategory } from './sections/recognition';
import { renderRulesSection } from './sections/rules';
import { renderOpenSection } from './sections/open';
import { renderDebugSection } from './sections/debug';

// 分类内容渲染映射
const categoryRenderers: Record<CategoryId, () => HTMLElement> = {
  recognition: renderRecognitionCategory,
  rules: renderRulesSection,
  open: renderOpenSection,
  debug: renderDebugSection,
};

export function createSettingsPanel(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'dnt-settings-overlay';
  overlay.className = 'dnt-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'dnt-dialog';

  // 头部
  const header = createHeader();
  dialog.appendChild(header);

  // 主体区域 - 左右分栏
  const body = document.createElement('div');
  body.className = 'dnt-body';

  // 左侧分类导航
  const sidebar = createSidebar();
  body.appendChild(sidebar);

  // 右侧内容区
  const contentArea = document.createElement('div');
  contentArea.className = 'dnt-content-area';
  contentArea.id = 'dnt-content-area';

  // 默认显示第一个分类(论坛识别)的内容
  const defaultRenderer = categoryRenderers['recognition'];
  if (defaultRenderer) {
    contentArea.appendChild(defaultRenderer());
  }

  body.appendChild(contentArea);

  dialog.appendChild(body);
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
    import('./settings').then(({ openSettings }) => openSettings());
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

function createSidebar(): HTMLElement {
  const sidebar = document.createElement('div');
  sidebar.className = 'dnt-sidebar';

  CATEGORIES.forEach((category, index) => {
    const btn = document.createElement('button');
    btn.className = 'dnt-category-btn';
    btn.setAttribute('data-category', category.id);

    // 第一个分类按钮默认激活
    if (index === 0) {
      btn.classList.add('dnt-category-active');
    }

    const icon = document.createElement('span');
    icon.className = 'dnt-category-icon';
    icon.innerHTML = category.icon;
    btn.appendChild(icon);

    const label = document.createElement('span');
    label.className = 'dnt-category-label';
    label.textContent = t(category.labelKey);
    btn.appendChild(label);

    btn.addEventListener('click', () => {
      switchCategory(category.id);
    });

    sidebar.appendChild(btn);
  });

  return sidebar;
}

function switchCategory(categoryId: CategoryId) {
  // 更新导航按钮状态
  const buttons = document.querySelectorAll('.dnt-category-btn');
  buttons.forEach((btn) => {
    if (btn.getAttribute('data-category') === categoryId) {
      btn.classList.add('dnt-category-active');
    } else {
      btn.classList.remove('dnt-category-active');
    }
  });

  // 更新内容区
  const contentArea = document.getElementById('dnt-content-area');
  if (contentArea) {
    contentArea.innerHTML = '';
    const renderer = categoryRenderers[categoryId];
    if (renderer) {
      contentArea.appendChild(renderer());
    }
  }
}
