// 调试区域：主开关与细分开关（中文注释）

import { t } from '../i18n';
import {
  getDebugEnabled,
  setDebugEnabled,
  getDebugCategories,
  setDebugCategory,
  setAllDebugCategories,
} from '../../debug/settings';

type CatKey = 'site' | 'click' | 'link' | 'rules' | 'final';

export function renderDebugSection(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'dnt-section';

  const title = document.createElement('h3');
  title.className = 'dnt-section-title';
  title.textContent = t('settings.debug.title');
  section.appendChild(title);

  const content = document.createElement('div');
  content.className = 'dnt-rules-content';

  const mainRow = document.createElement('div');
  mainRow.className = 'dnt-rule-item';
  const mainLabel = document.createElement('label');
  mainLabel.className = 'dnt-rule-label';
  mainLabel.textContent = t('settings.debug.enable');
  const mainToggle = createToggle(false, async (on) => {
    await setDebugEnabled(on);
    // 切换主开关时，显示/隐藏细分选项
    detailsBlock.style.display = on ? '' : 'none';
  });
  mainToggle.id = 'dnt-debug-main-toggle';
  mainRow.appendChild(mainLabel);
  mainRow.appendChild(mainToggle);
  content.appendChild(mainRow);

  const detailsBlock = document.createElement('div');
  detailsBlock.style.marginTop = '8px';

  // 操作行：一键开/关
  const opsRow = document.createElement('div');
  opsRow.className = 'dnt-input-row';
  const allOn = document.createElement('button');
  allOn.className = 'dnt-btn dnt-btn-secondary';
  allOn.textContent = t('settings.debug.allOn');
  allOn.addEventListener('click', async () => {
    await setAllDebugCategories(true);
    refreshDetailToggles(detailsBlock);
  });
  const allOff = document.createElement('button');
  allOff.className = 'dnt-btn dnt-btn-secondary';
  allOff.textContent = t('settings.debug.allOff');
  allOff.addEventListener('click', async () => {
    await setAllDebugCategories(false);
    refreshDetailToggles(detailsBlock);
  });
  opsRow.appendChild(allOn);
  opsRow.appendChild(allOff);
  detailsBlock.appendChild(opsRow);

  const cats: Array<{ key: CatKey; label: string }> = [
    { key: 'site', label: t('settings.debug.categories.site') },
    { key: 'click', label: t('settings.debug.categories.click') },
    { key: 'link', label: t('settings.debug.categories.link') },
    { key: 'rules', label: t('settings.debug.categories.rules') },
    { key: 'final', label: t('settings.debug.categories.final') },
  ];

  const listBlock = document.createElement('div');
  listBlock.className = 'dnt-rule-group';
  cats.forEach((c) => {
    const row = document.createElement('div');
    row.className = 'dnt-rule-item';

    const l = document.createElement('label');
    l.className = 'dnt-rule-label';
    l.textContent = c.label;

    const toggle = createToggle(true, async (on) => {
      await setDebugCategory(c.key, on);
    });
    toggle.setAttribute('data-debug-cat', c.key);

    row.appendChild(l);
    row.appendChild(toggle);
    listBlock.appendChild(row);
  });
  detailsBlock.appendChild(listBlock);

  content.appendChild(detailsBlock);

  // 初始状态：主开关默认关闭，不显示细分
  (async () => {
    const on = await getDebugEnabled();
    setToggleVisual(mainToggle, on);
    detailsBlock.style.display = on ? '' : 'none';
    await refreshDetailToggles(detailsBlock);
  })();

  section.appendChild(content);
  return section;
}

async function refreshDetailToggles(container: HTMLElement) {
  const cats = await getDebugCategories();
  container.querySelectorAll('[data-debug-cat]')
    .forEach((el) => {
      const key = (el as HTMLElement).getAttribute('data-debug-cat') as CatKey;
      const on = cats[key as keyof typeof cats] ?? true;
      setToggleVisual(el as HTMLElement, on);
    });
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

