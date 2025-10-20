// 后台打开设置界面 - 全新UI设计

import { t } from '../i18n';
import { getBackgroundOpenMode, setBackgroundOpenMode, type BackgroundOpenMode } from '../../storage/openMode';
import { getFloatBallEnabled, setFloatBallEnabled, getFloatBallFixed, setFloatBallFixed, getAllowedModes, setAllowedModes } from '../../storage/floatBall';
import { setFloatBallShown, resetFloatBallPosition, setFloatBallFixedMode, updateAllowedModes, syncCurrentModeFromStorage } from '../../floatball/index';
import { logBgModeChange } from '../../debug/logger';

export function renderOpenSection(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'dnt-section';

  // 标题
  const title = document.createElement('h3');
  title.className = 'dnt-section-title';
  title.textContent = t('settings.openMode.title');
  section.appendChild(title);

  // 说明文本区域
  const infoBox = createInfoBox(t('settings.openMode.description'));
  section.appendChild(infoBox);

  // 当前模式 - 分段控制器
  const modeBlock = document.createElement('div');
  modeBlock.className = 'dnt-list-block';
  modeBlock.style.marginTop = '16px';

  const modeLabel = document.createElement('div');
  modeLabel.className = 'dnt-list-subtitle';
  modeLabel.textContent = t('settings.openMode.selectLabel');
  modeBlock.appendChild(modeLabel);

  const segmentedControl = createSegmentedControl();
  modeBlock.appendChild(segmentedControl);

  section.appendChild(modeBlock);

  // 悬浮球设置 - 大标题样式
  const floatballTitle = document.createElement('h3');
  floatballTitle.className = 'dnt-section-title';
  floatballTitle.textContent = t('settings.openMode.floatball.title');
  floatballTitle.style.marginTop = '32px';
  section.appendChild(floatballTitle);

  // 悬浮球提示文本
  const floatballTip = createInfoBox(t('settings.openMode.floatball.tip'));
  section.appendChild(floatballTip);

  // === 显示设置 ===
  const displayBlock = document.createElement('div');
  displayBlock.className = 'dnt-list-block';
  displayBlock.style.marginTop = '16px';

  const displayTitle = document.createElement('div');
  displayTitle.className = 'dnt-list-subtitle';
  displayTitle.textContent = t('settings.openMode.floatball.displayTitle');
  displayBlock.appendChild(displayTitle);

  // 显示悬浮球开关
  const showRow = createToggleRow(
    t('settings.openMode.floatball.show'),
    t('settings.openMode.floatball.showDesc'),
    false,
    async (on) => {
      await setFloatBallShown(on);
    }
  );
  displayBlock.appendChild(showRow.row);

  // 固定位置开关
  const fixedRow = createToggleRow(
    t('settings.openMode.floatball.fixed'),
    t('settings.openMode.floatball.fixedDesc'),
    false,
    async (on) => {
      await setFloatBallFixedMode(on);
    }
  );
  displayBlock.appendChild(fixedRow.row);

  // 重置位置按钮
  const resetRow = document.createElement('div');
  resetRow.style.marginTop = '12px';
  const resetBtn = document.createElement('button');
  resetBtn.className = 'dnt-btn dnt-btn-secondary';
  resetBtn.textContent = t('settings.openMode.floatball.reset');
  resetBtn.addEventListener('click', async () => {
    await resetFloatBallPosition();
  });
  resetRow.appendChild(resetBtn);
  displayBlock.appendChild(resetRow);

  section.appendChild(displayBlock);

  // === 切换设置 ===
  const switchBlock = document.createElement('div');
  switchBlock.className = 'dnt-list-block';
  switchBlock.style.marginTop = '16px';

  const switchTitle = document.createElement('div');
  switchTitle.className = 'dnt-list-subtitle';
  switchTitle.textContent = t('settings.openMode.floatball.switchTitle');
  switchBlock.appendChild(switchTitle);

  // 可切换模式 - 卡片选择器
  const modesLabel = document.createElement('div');
  modesLabel.className = 'dnt-subsection-label';
  modesLabel.textContent = t('settings.openMode.floatball.modes');
  modesLabel.style.marginTop = '12px';
  modesLabel.style.marginBottom = '8px';
  switchBlock.appendChild(modesLabel);

  const modesDesc = document.createElement('div');
  modesDesc.className = 'dnt-hint-text';
  modesDesc.textContent = t('settings.openMode.floatball.modesDesc');
  modesDesc.style.marginBottom = '12px';
  switchBlock.appendChild(modesDesc);

  const modeCards = createModeCardSelector();
  switchBlock.appendChild(modeCards.container);

  section.appendChild(switchBlock);

  // 初始化数据回填
  (async () => {
    const mode = await getBackgroundOpenMode();
    const enabled = await getFloatBallEnabled();
    const fixed = await getFloatBallFixed();
    const allowed = await getAllowedModes();

    setSegmentedValue(segmentedControl, mode);
    setToggleVisual(showRow.toggle, enabled);
    setToggleVisual(fixedRow.toggle, fixed);
    setModeCardsValue(modeCards, allowed);
  })();

  return section;
}

// 创建信息提示框
function createInfoBox(text: string): HTMLElement {
  const box = document.createElement('div');
  box.className = 'dnt-info-box';

  const icon = document.createElement('span');
  icon.className = 'dnt-info-icon';
  icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>`;
  box.appendChild(icon);

  const textEl = document.createElement('span');
  textEl.className = 'dnt-info-text';
  textEl.textContent = text;
  box.appendChild(textEl);

  return box;
}

// 创建分段控制器
function createSegmentedControl(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'dnt-segmented-control';
  container.setAttribute('role', 'radiogroup');
  container.setAttribute('aria-label', t('settings.openMode.selectLabel'));

  const modes: BackgroundOpenMode[] = ['none', 'topic', 'all'];

  modes.forEach((mode, index) => {
    const button = document.createElement('button');
    button.className = 'dnt-segment-btn';
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', 'false');
    button.setAttribute('data-mode', mode);

    const label = document.createElement('span');
    label.className = 'dnt-segment-label';
    label.textContent = t(`settings.openMode.options.${mode}`);
    button.appendChild(label);

    const desc = document.createElement('span');
    desc.className = 'dnt-segment-desc';
    desc.textContent = t(`settings.openMode.optionDesc.${mode}`);
    button.appendChild(desc);

    button.addEventListener('click', async () => {
      await setBackgroundOpenMode(mode);
      await syncCurrentModeFromStorage();
      await logBgModeChange(mode, 'settings');
      setSegmentedValue(container, mode);
    });

    container.appendChild(button);
  });

  return container;
}

// 设置分段控制器的选中值
function setSegmentedValue(container: HTMLElement, mode: BackgroundOpenMode) {
  const buttons = container.querySelectorAll('.dnt-segment-btn');
  buttons.forEach((btn) => {
    const isActive = btn.getAttribute('data-mode') === mode;
    if (isActive) {
      btn.classList.add('dnt-segment-active');
      btn.setAttribute('aria-checked', 'true');
    } else {
      btn.classList.remove('dnt-segment-active');
      btn.setAttribute('aria-checked', 'false');
    }
  });
}

// 创建开关行
function createToggleRow(
  label: string,
  description: string,
  initial: boolean,
  onChange: (on: boolean) => void | Promise<void>
): { row: HTMLElement; toggle: HTMLElement } {
  const row = document.createElement('div');
  row.className = 'dnt-toggle-row';

  const labelWrap = document.createElement('div');
  labelWrap.className = 'dnt-toggle-label-wrap';

  const labelEl = document.createElement('div');
  labelEl.className = 'dnt-toggle-label';
  labelEl.textContent = label;
  labelWrap.appendChild(labelEl);

  const descEl = document.createElement('div');
  descEl.className = 'dnt-toggle-desc';
  descEl.textContent = description;
  labelWrap.appendChild(descEl);

  row.appendChild(labelWrap);

  const toggle = createToggle(initial, onChange);
  row.appendChild(toggle);

  return { row, toggle };
}

// 创建开关组件
function createToggle(initial: boolean, onChange: (on: boolean) => void | Promise<void>): HTMLElement {
  const toggle = document.createElement('div');
  toggle.className = `dnt-toggle ${initial ? 'dnt-toggle-on' : 'dnt-toggle-off'}`;
  toggle.setAttribute('role', 'switch');
  toggle.setAttribute('aria-checked', initial ? 'true' : 'false');

  const track = document.createElement('div');
  track.className = 'dnt-toggle-track';

  const thumb = document.createElement('div');
  thumb.className = 'dnt-toggle-thumb';

  track.appendChild(thumb);
  toggle.appendChild(track);

  toggle.addEventListener('click', async () => {
    const current = toggle.classList.contains('dnt-toggle-on');
    const next = !current;
    await onChange(next);
    setToggleVisual(toggle, next);
  });

  return toggle;
}

// 设置开关的视觉状态
function setToggleVisual(el: HTMLElement, on: boolean) {
  el.classList.remove('dnt-toggle-on', 'dnt-toggle-off');
  el.classList.add(on ? 'dnt-toggle-on' : 'dnt-toggle-off');
  el.setAttribute('aria-checked', on ? 'true' : 'false');
}

// 创建模式卡片选择器
function createModeCardSelector(): { container: HTMLElement; cards: Array<{ el: HTMLElement; mode: BackgroundOpenMode; checkbox: HTMLInputElement }> } {
  const container = document.createElement('div');
  container.className = 'dnt-mode-cards';
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', t('settings.openMode.floatball.modes'));

  const modes: BackgroundOpenMode[] = ['none', 'topic', 'all'];
  const cards: Array<{ el: HTMLElement; mode: BackgroundOpenMode; checkbox: HTMLInputElement }> = [];

  modes.forEach((mode) => {
    const card = document.createElement('label');
    card.className = 'dnt-mode-card';
    card.setAttribute('data-mode', mode);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'dnt-mode-card-checkbox';
    checkbox.setAttribute('data-mode', mode);
    card.appendChild(checkbox);

    const content = document.createElement('div');
    content.className = 'dnt-mode-card-content';

    const icon = document.createElement('div');
    icon.className = 'dnt-mode-card-icon';
    icon.innerHTML = getModeIcon(mode);
    content.appendChild(icon);

    const label = document.createElement('div');
    label.className = 'dnt-mode-card-label';
    label.textContent = t(`settings.openMode.options.${mode}`);
    content.appendChild(label);

    const desc = document.createElement('div');
    desc.className = 'dnt-mode-card-desc';
    desc.textContent = t(`settings.openMode.optionDesc.${mode}`);
    content.appendChild(desc);

    const checkmark = document.createElement('div');
    checkmark.className = 'dnt-mode-card-checkmark';
    checkmark.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`;
    content.appendChild(checkmark);

    card.appendChild(content);
    container.appendChild(card);

    cards.push({ el: card, mode, checkbox });
  });

  // 处理选择逻辑
  const updateCards = async () => {
    const selected = cards.filter(c => c.checkbox.checked);
    const count = selected.length;

    // 至少保留2个选项
    cards.forEach(c => {
      const isLastTwo = count === 2 && c.checkbox.checked;
      if (isLastTwo) {
        c.el.classList.add('dnt-mode-card-min-required');
        c.el.title = t('settings.openMode.floatball.modesDesc');
      } else {
        c.el.classList.remove('dnt-mode-card-min-required');
        c.el.title = '';
      }

      if (c.checkbox.checked) {
        c.el.classList.add('dnt-mode-card-checked');
      } else {
        c.el.classList.remove('dnt-mode-card-checked');
      }
    });

    // 保存到存储
    const allowedModes = {
      none: cards.find(c => c.mode === 'none')!.checkbox.checked,
      topic: cards.find(c => c.mode === 'topic')!.checkbox.checked,
      all: cards.find(c => c.mode === 'all')!.checkbox.checked,
    };
    await setAllowedModes(allowedModes);
    await updateAllowedModes(allowedModes);
  };

  cards.forEach(c => {
    c.checkbox.addEventListener('change', async (e) => {
      const selected = cards.filter(card => card.checkbox.checked);

      // 如果尝试取消选择且只剩2个,则阻止
      if (!c.checkbox.checked && selected.length < 2) {
        c.checkbox.checked = true;
        e.preventDefault();
        return;
      }

      await updateCards();
    });
  });

  return { container, cards };
}

// 设置卡片选择器的值
function setModeCardsValue(
  modeCards: { container: HTMLElement; cards: Array<{ el: HTMLElement; mode: BackgroundOpenMode; checkbox: HTMLInputElement }> },
  allowed: Record<BackgroundOpenMode, boolean>
) {
  modeCards.cards.forEach(c => {
    c.checkbox.checked = allowed[c.mode];
    if (c.checkbox.checked) {
      c.el.classList.add('dnt-mode-card-checked');
    } else {
      c.el.classList.remove('dnt-mode-card-checked');
    }
  });

  // 检查是否需要标记最小要求
  const selected = modeCards.cards.filter(c => c.checkbox.checked);
  if (selected.length === 2) {
    selected.forEach(c => {
      c.el.classList.add('dnt-mode-card-min-required');
      c.el.title = t('settings.openMode.floatball.modesDesc');
    });
  }
}

// 获取模式图标
function getModeIcon(mode: BackgroundOpenMode): string {
  const icons: Record<BackgroundOpenMode, string> = {
    none: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`,
    topic: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>`,
    all: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>`,
  };
  return icons[mode];
}
