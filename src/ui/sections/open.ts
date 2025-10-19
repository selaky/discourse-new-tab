// 链接打开方式：后台打开新标签页

import { t } from '../i18n';
import { getBackgroundOpenMode, setBackgroundOpenMode, type BackgroundOpenMode } from '../../storage/openMode';
import { getFloatBallEnabled, setFloatBallEnabled, getFloatBallFixed, setFloatBallFixed, getAllowedModes, setAllowedModes } from '../../storage/floatBall';
import { setFloatBallShown, resetFloatBallPosition, setFloatBallFixedMode, updateAllowedModes, syncCurrentModeFromStorage } from '../../floatball/index';
import { logBgModeChange } from '../../debug/logger';

export function renderOpenSection(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'dnt-section';

  const title = document.createElement('h3');
  title.className = 'dnt-section-title';
  title.textContent = t('settings.openMode.title');
  section.appendChild(title);

  const block = document.createElement('div');
  block.className = 'dnt-list-block';

  const row = document.createElement('div');
  row.className = 'dnt-input-row';

  const label = document.createElement('label');
  label.className = 'dnt-rule-label';
  label.style.flex = '0 0 auto';
  label.textContent = t('settings.openMode.selectLabel');
  row.appendChild(label);

  const select = document.createElement('select');
  select.className = 'dnt-input';
  select.style.maxWidth = '260px';

  const options: Array<{ value: BackgroundOpenMode; text: string }> = [
    { value: 'none', text: t('settings.openMode.options.none') },
    { value: 'topic', text: t('settings.openMode.options.topic') },
    { value: 'all', text: t('settings.openMode.options.all') },
  ];
  for (const opt of options) {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.text;
    select.appendChild(o);
  }

  (async () => {
    const mode = await getBackgroundOpenMode();
    select.value = mode;
  })();

  select.addEventListener('change', async () => {
    const val = (select.value as BackgroundOpenMode);
    await setBackgroundOpenMode(val);
    await syncCurrentModeFromStorage();
    await logBgModeChange(val, 'settings');
  });

  row.appendChild(select);
  block.appendChild(row);
  section.appendChild(block);

  // —— 悬浮球控制 ——
  const fb = document.createElement('div');
  fb.className = 'dnt-list-block';

  // 显示/隐藏
  const rowShow = document.createElement('div');
  rowShow.className = 'dnt-rule-item';
  const labelShow = document.createElement('label');
  labelShow.className = 'dnt-rule-label';
  labelShow.textContent = t('settings.openMode.floatball.show');
  const toggleShow = createToggle(false, async (on) => {
    await setFloatBallShown(on);
  });
  rowShow.appendChild(labelShow);
  rowShow.appendChild(toggleShow);
  fb.appendChild(rowShow);

  // 固定位置
  const rowFix = document.createElement('div');
  rowFix.className = 'dnt-rule-item';
  const labelFix = document.createElement('label');
  labelFix.className = 'dnt-rule-label';
  labelFix.textContent = t('settings.openMode.floatball.fixed');
  const toggleFix = createToggle(false, async (on) => {
    await setFloatBallFixedMode(on);
  });
  rowFix.appendChild(labelFix);
  rowFix.appendChild(toggleFix);
  fb.appendChild(rowFix);

  // 重置位置
  const rowReset = document.createElement('div');
  rowReset.className = 'dnt-input-row';
  const btnReset = document.createElement('button');
  btnReset.className = 'dnt-btn dnt-btn-secondary';
  btnReset.textContent = t('settings.openMode.floatball.reset');
  btnReset.addEventListener('click', async () => {
    await resetFloatBallPosition();
  });
  rowReset.appendChild(btnReset);
  fb.appendChild(rowReset);

  // 可切换的类型（至少 2 项）
  const rowModes = document.createElement('div');
  rowModes.className = 'dnt-input-row';
  const modeLabel = document.createElement('label');
  modeLabel.className = 'dnt-rule-label';
  modeLabel.style.flex = '0 0 auto';
  modeLabel.textContent = t('settings.openMode.floatball.modes');
  rowModes.appendChild(modeLabel);

  const boxWrap = document.createElement('div');
  boxWrap.style.display = 'flex';
  boxWrap.style.gap = '12px';
  const cbNone = createCheckbox(t('settings.openMode.options.none'));
  const cbTopic = createCheckbox(t('settings.openMode.options.topic'));
  const cbAll = createCheckbox(t('settings.openMode.options.all'));
  cbNone.input.setAttribute('data-mode', 'none');
  cbTopic.input.setAttribute('data-mode', 'topic');
  cbAll.input.setAttribute('data-mode', 'all');
  boxWrap.appendChild(cbNone.wrap);
  boxWrap.appendChild(cbTopic.wrap);
  boxWrap.appendChild(cbAll.wrap);
  rowModes.appendChild(boxWrap);
  fb.appendChild(rowModes);

  // 初始值回填
  (async () => {
    setToggleVisual(toggleShow, await getFloatBallEnabled());
    setToggleVisual(toggleFix, await getFloatBallFixed());
    const am = await getAllowedModes();
    cbNone.input.checked = !!am.none;
    cbTopic.input.checked = !!am.topic;
    cbAll.input.checked = !!am.all;
  })();

  // 变更逻辑：至少保持两项为 true
  const onCheckbox = async (e?: Event) => {
    const next = {
      none: cbNone.input.checked,
      topic: cbTopic.input.checked,
      all: cbAll.input.checked,
    };
    const count = (next.none?1:0) + (next.topic?1:0) + (next.all?1:0);
    if (count < 2) {
      // 自动回滚当前操作（保持上一次状态）
      const target = (e?.target as HTMLInputElement | undefined);
      if (target) target.checked = !target.checked;
      return;
    }
    await setAllowedModes(next);
    await updateAllowedModes(next);
  };
  cbNone.input.addEventListener('change', onCheckbox);
  cbTopic.input.addEventListener('change', onCheckbox);
  cbAll.input.addEventListener('change', onCheckbox);

  section.appendChild(fb);

  return section;
}

function createToggle(initial: boolean, onChange: (on: boolean) => void | Promise<void>): HTMLElement {
  const toggle = document.createElement('div');
  toggle.className = `dnt-toggle ${initial ? 'dnt-toggle-on' : 'dnt-toggle-off'}`;

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

function setToggleVisual(el: HTMLElement, on: boolean) {
  el.classList.remove('dnt-toggle-on', 'dnt-toggle-off');
  el.classList.add(on ? 'dnt-toggle-on' : 'dnt-toggle-off');
}

function createCheckbox(label: string): { wrap: HTMLElement; input: HTMLInputElement } {
  const wrap = document.createElement('label');
  wrap.style.display = 'inline-flex';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '6px';
  const input = document.createElement('input');
  input.type = 'checkbox';
  const span = document.createElement('span');
  span.textContent = label;
  wrap.appendChild(input);
  wrap.appendChild(span);
  return { wrap, input };
}

