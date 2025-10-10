// 论坛识别区域(白/黑名单管理)
import {
  getLists,
  addToWhitelist,
  removeFromWhitelist,
  addToBlacklist,
  removeFromBlacklist,
  getCurrentHostname,
} from '../../storage/domainLists';
import { t } from '../i18n';
import { refreshStatusSection } from './status';

export function renderDomainSection(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'dnt-section';

  const title = document.createElement('h3');
  title.className = 'dnt-section-title';
  title.textContent = t('settings.domain.title');
  section.appendChild(title);

  const content = document.createElement('div');
  content.className = 'dnt-domain-content';

  // 白名单
  const whitelistBlock = createListBlock('whitelist');
  content.appendChild(whitelistBlock);

  // 黑名单
  const blacklistBlock = createListBlock('blacklist');
  content.appendChild(blacklistBlock);

  section.appendChild(content);

  return section;
}

function createListBlock(type: 'whitelist' | 'blacklist'): HTMLElement {
  const block = document.createElement('div');
  block.className = 'dnt-list-block';

  const subtitle = document.createElement('h4');
  subtitle.className = 'dnt-list-subtitle';
  subtitle.textContent = t(`settings.domain.${type}`);
  block.appendChild(subtitle);

  const list = document.createElement('div');
  list.className = 'dnt-domain-list';
  list.id = `dnt-${type}`;
  block.appendChild(list);

  // 输入区
  const inputRow = document.createElement('div');
  inputRow.className = 'dnt-input-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'dnt-input';
  input.placeholder = t('settings.domain.placeholder');
  inputRow.appendChild(input);

  const addBtn = document.createElement('button');
  addBtn.className = 'dnt-btn dnt-btn-primary';
  addBtn.textContent = t('settings.domain.add');
  addBtn.addEventListener('click', async () => {
    const domain = input.value.trim();
    if (domain) {
      await handleAdd(type, domain);
      input.value = ''; // 添加成功后清空输入框
    }
  });
  inputRow.appendChild(addBtn);

  block.appendChild(inputRow);

  // 添加当前域名按钮
  const addCurrentBtn = document.createElement('button');
  addCurrentBtn.className = 'dnt-btn dnt-btn-secondary';
  addCurrentBtn.textContent = t('settings.domain.addCurrent');
  addCurrentBtn.addEventListener('click', () => {
    const host = getCurrentHostname();
    handleAdd(type, host);
  });
  block.appendChild(addCurrentBtn);

  // 加载列表
  refreshList(type);

  return block;
}

async function refreshList(type: 'whitelist' | 'blacklist') {
  const lists = await getLists();
  const domains = lists[type];
  const container = document.getElementById(`dnt-${type}`);
  if (!container) return;

  container.innerHTML = '';

  if (domains.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'dnt-empty-text';
    empty.textContent = t('settings.domain.empty');
    container.appendChild(empty);
    return;
  }

  domains.forEach((domain) => {
    const item = document.createElement('div');
    item.className = 'dnt-domain-item';

    const text = document.createElement('span');
    text.className = 'dnt-domain-text';
    text.textContent = domain;
    item.appendChild(text);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'dnt-btn dnt-btn-danger dnt-btn-sm';
    deleteBtn.textContent = t('settings.domain.delete');
    deleteBtn.addEventListener('click', () => handleDelete(type, domain));
    item.appendChild(deleteBtn);

    container.appendChild(item);
  });
}

async function handleAdd(type: 'whitelist' | 'blacklist', domain: string) {
  if (!domain) return;

  const fn = type === 'whitelist' ? addToWhitelist : addToBlacklist;
  const result = await fn(domain);

  if (result.added) {
    await refreshList(type);
    // 刷新状态区域
    await refreshStatusSection();
  }
}

async function handleDelete(type: 'whitelist' | 'blacklist', domain: string) {
  const fn = type === 'whitelist' ? removeFromWhitelist : removeFromBlacklist;
  const result = await fn(domain);

  if (result.removed) {
    await refreshList(type);
    // 刷新状态区域
    await refreshStatusSection();
  }
}
