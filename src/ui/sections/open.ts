// 链接打开方式：后台打开新标签页

import { t } from '../i18n';
import { getBackgroundOpenMode, setBackgroundOpenMode, type BackgroundOpenMode } from '../../storage/openMode';

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
  });

  row.appendChild(select);
  block.appendChild(row);
  section.appendChild(block);

  return section;
}

