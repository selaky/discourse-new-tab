import type { ConfigManager } from '../core/config';
import type { ActivationResult } from '../core/forumDetector';
import type { RuleSwitches } from '../types/config';
import { injectStyles } from '../utils/style';

type ListType = 'whitelist' | 'blacklist';

interface InitOptions {
  configManager: ConfigManager;
  activation: ActivationResult;
  host: string;
}

const STYLE = `
.dnt-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 25, 45, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2147482999;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.dnt-overlay.is-open {
  display: flex;
}
.dnt-panel {
  background: #fff;
  color: #1b1d24;
  width: 580px;
  max-width: 100%;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dnt-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(to bottom, #fafbff, #fff);
}
.dnt-panel__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1b1d24;
}
.dnt-panel__close {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dnt-panel__close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}
.dnt-panel__content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}
.dnt-section + .dnt-section {
  margin-top: 28px;
}
.dnt-section h3 {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #2c2e33;
}
.dnt-rule-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
}
.dnt-rule-item input[type="checkbox"] {
  margin-top: 2px;
  cursor: pointer;
  width: 16px;
  height: 16px;
}
.dnt-rule-item label {
  font-size: 14px;
  font-weight: 500;
  color: #2c2e33;
  cursor: pointer;
  flex: 1;
  line-height: 1.6;
}
.dnt-rule-item span {
  font-size: 13px;
  color: #6b7280;
  display: block;
  font-weight: 400;
  margin-top: 2px;
}
.dnt-lists {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.dnt-list-block {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 16px;
  background: #fafbfc;
}
.dnt-list-block header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.dnt-list-block header span {
  font-size: 14px;
  font-weight: 600;
  color: #2c2e33;
}
.dnt-list-block header small {
  font-size: 12px;
  color: #6b7280;
}
.dnt-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 160px;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.dnt-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.dnt-list li:last-child {
  border-bottom: none;
}
.dnt-list li span {
  color: #2c2e33;
  word-break: break-all;
}
.dnt-list button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #5662f6;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}
.dnt-list button:hover {
  background: rgba(86, 98, 246, 0.1);
  color: #3f4de6;
}
.dnt-list-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.dnt-add-form {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.dnt-add-form input {
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}
.dnt-add-form input:focus {
  border-color: #5662f6;
}
.dnt-add-form button {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
.dnt-add {
  background: #5662f6;
  color: #fff;
}
.dnt-add:hover {
  background: #3f4de6;
}
.dnt-cancel {
  background: #e5e7eb;
  color: #4b5563;
}
.dnt-cancel:hover {
  background: #d1d5db;
}
.dnt-status {
  font-size: 13px;
  border-radius: 10px;
  padding: 14px 16px;
  background: #f0f4ff;
  color: #374151;
  line-height: 1.7;
  white-space: pre-line;
  border-left: 3px solid #5662f6;
}
`; // end STYLE

const RULE_TEXT: Record<keyof RuleSwitches, string> = {
  enableTopicNewTab: '新标签页打开主题帖',
  keepSameTopicInTab: '在原标签页进行楼层跳转',
  openUserProfileInNewTab: '新标签页打开用户主页',
  keepNonTopicDefault: '非主题帖页面保留默认打开方式',
  skipAttachments: '附件类保留默认打开方式',
  skipPopupLike: '按钮、弹窗保留默认打开方式'
};

let panelInitialized = false;
let openPanelFn: (() => void) | null = null;

export function initSettingsPanel(options: InitOptions): void {
  if (panelInitialized) {
    return;
  }
  panelInitialized = true;

  const { configManager, activation, host } = options;

  injectStyles(STYLE);

  const overlay = document.createElement('div');
  overlay.className = 'dnt-overlay';

  const panel = document.createElement('div');
  panel.className = 'dnt-panel';

  const header = document.createElement('div');
  header.className = 'dnt-panel__header';

  const title = document.createElement('h2');
  title.textContent = 'Discourse 新标签设置';
  header.appendChild(title);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'dnt-panel__close';
  closeButton.setAttribute('aria-label', '关闭');
  closeButton.textContent = '×';
  header.appendChild(closeButton);

  const content = document.createElement('div');
  content.className = 'dnt-panel__content';

  const statusBox = document.createElement('div');
  statusBox.className = 'dnt-status';
  content.appendChild(statusBox);

  const rulesSection = document.createElement('section');
  rulesSection.className = 'dnt-section';
  const rulesTitle = document.createElement('h3');
  rulesTitle.textContent = '判断规则';
  rulesSection.appendChild(rulesTitle);
  const rulesContainer = document.createElement('div');
  rulesSection.appendChild(rulesContainer);

  const listsSection = document.createElement('section');
  listsSection.className = 'dnt-section';
  const listsTitle = document.createElement('h3');
  listsTitle.textContent = '域名控制';
  listsSection.appendChild(listsTitle);
  const listsWrapper = document.createElement('div');
  listsWrapper.className = 'dnt-lists';
  listsSection.appendChild(listsWrapper);
  content.appendChild(listsSection);
  content.appendChild(rulesSection);

  panel.appendChild(header);
  panel.appendChild(content);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const checkboxMap = new Map<keyof RuleSwitches, HTMLInputElement>();
  const listElements: Record<ListType, HTMLUListElement> = {
    whitelist: document.createElement('ul'),
    blacklist: document.createElement('ul')
  };
  listElements.whitelist.className = 'dnt-list';
  listElements.blacklist.className = 'dnt-list';

  const listInputs: Record<ListType, HTMLInputElement> = {
    whitelist: document.createElement('input'),
    blacklist: document.createElement('input')
  };
  const listActions: Record<ListType, { submit: HTMLButtonElement; cancel: HTMLButtonElement }> = {
    whitelist: {
      submit: document.createElement('button'),
      cancel: document.createElement('button')
    },
    blacklist: {
      submit: document.createElement('button'),
      cancel: document.createElement('button')
    }
  };

  const editState: { type: ListType | null; original: string | null } = {
    type: null,
    original: null
  };

  function renderRules(): void {
    rulesContainer.innerHTML = '';
    const configRules = configManager.getConfig().rules;
    (Object.keys(RULE_TEXT) as Array<keyof RuleSwitches>).forEach((key) => {
      const row = document.createElement('div');
      row.className = 'dnt-rule-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = configRules[key];
      checkbox.id = `dnt-rule-${key}`;
      checkboxMap.set(key, checkbox);

      checkbox.addEventListener('change', () => {
        const latest = configManager.getConfig().rules;
        const next: RuleSwitches = { ...latest, [key]: checkbox.checked };
        configManager.replaceRules(next);
        refreshStatus();
      });

      const label = document.createElement('label');
      label.setAttribute('for', checkbox.id);
      label.textContent = RULE_TEXT[key];

      row.appendChild(checkbox);
      row.appendChild(label);
      rulesContainer.appendChild(row);
    });
  }

  function applyListChange(type: ListType, value: string, original?: string | null): void {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      return;
    }
    if (original) {
      if (type === 'whitelist') {
        configManager.removeFromWhitelist(original);
      } else {
        configManager.removeFromBlacklist(original);
      }
    }
    if (type === 'whitelist') {
      configManager.addToWhitelist(trimmed);
    } else {
      configManager.addToBlacklist(trimmed);
    }
    refreshLists();
  }

  function startEdit(type: ListType, domain: string): void {
    editState.type = type;
    editState.original = domain;
    listInputs[type].value = domain;
    listActions[type].submit.textContent = '保存';
    listActions[type].cancel.style.display = 'inline-flex';
    listInputs[type].focus();
  }

  function resetEditState(type: ListType): void {
    editState.type = null;
    editState.original = null;
    listInputs[type].value = '';
    listActions[type].submit.textContent = '添加';
    listActions[type].cancel.style.display = 'none';
  }

  function buildListBlock(type: ListType, titleText: string, description: string): HTMLDivElement {
    const block = document.createElement('div');
    block.className = 'dnt-list-block';

    const headerEl = document.createElement('header');
    const heading = document.createElement('span');
    heading.textContent = titleText;
    headerEl.appendChild(heading);

    const desc = document.createElement('small');
    desc.textContent = description;
    headerEl.appendChild(desc);

    block.appendChild(headerEl);
    block.appendChild(listElements[type]);

    const form = document.createElement('div');
    form.className = 'dnt-add-form';

    const input = listInputs[type];
    input.type = 'text';
    input.placeholder = '输入域名，如: meta.appinn.net';
    form.appendChild(input);

    const submitButton = listActions[type].submit;
    submitButton.type = 'button';
    submitButton.className = 'dnt-add';
    submitButton.textContent = '添加';
    form.appendChild(submitButton);

    const cancelButton = listActions[type].cancel;
    cancelButton.type = 'button';
    cancelButton.className = 'dnt-cancel';
    cancelButton.textContent = '取消';
    cancelButton.style.display = 'none';
    form.appendChild(cancelButton);

    submitButton.addEventListener('click', () => {
      const original = editState.type === type ? editState.original : null;
      applyListChange(type, input.value, original);
      resetEditState(type);
    });

    cancelButton.addEventListener('click', () => {
      resetEditState(type);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitButton.click();
      }
    });

    block.appendChild(form);
    return block;
  }

  function renderList(type: ListType): void {
    const list = listElements[type];
    list.innerHTML = '';
    const values = type === 'whitelist'
      ? configManager.getConfig().whitelist
      : configManager.getConfig().blacklist;

    if (!values.length) {
      const empty = document.createElement('li');
      empty.textContent = '（空）';
      empty.style.color = '#9ca3af';
      list.appendChild(empty);
      return;
    }

    values.forEach((domain) => {
      const item = document.createElement('li');
      const text = document.createElement('span');
      text.textContent = domain;
      item.appendChild(text);

      const actions = document.createElement('div');
      actions.className = 'dnt-list-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.textContent = '编辑';
      editBtn.addEventListener('click', () => startEdit(type, domain));

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '删除';
      removeBtn.addEventListener('click', () => {
        if (type === 'whitelist') {
          configManager.removeFromWhitelist(domain);
        } else {
          configManager.removeFromBlacklist(domain);
        }
        if (editState.type === type && editState.original === domain) {
          resetEditState(type);
        }
        refreshLists();
      });

      actions.appendChild(editBtn);
      actions.appendChild(removeBtn);
      item.appendChild(actions);
      list.appendChild(item);
    });
  }

  function refreshLists(): void {
    renderList('whitelist');
    renderList('blacklist');
    refreshStatus();
  }

  function refreshStatus(): void {
    const isWhitelisted = configManager.isWhitelisted(host);
    const isBlacklisted = configManager.isBlacklisted(host);
    const lines: string[] = [];
    lines.push(`域名: ${host}`);
    if (isBlacklisted) {
      lines.push('状态: 已禁用（黑名单）');
    } else if (isWhitelisted) {
      lines.push('状态: 已启用（白名单）');
    } else {
      lines.push(`状态: ${activation.reason === 'auto-detected' ? '已启用（自动检测）' : '已启用'}`);
    }
    statusBox.textContent = lines.join('\n');
  }

  function openPanel(): void {
    overlay.classList.add('is-open');
    refreshLists();
  }

  function closePanel(): void {
    overlay.classList.remove('is-open');
    resetEditState('whitelist');
    resetEditState('blacklist');
  }

  openPanelFn = openPanel;

  closeButton.addEventListener('click', () => {
    closePanel();
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closePanel();
    }
  });

  listsWrapper.appendChild(buildListBlock('whitelist', '白名单', '强制启用脚本'));
  listsWrapper.appendChild(buildListBlock('blacklist', '黑名单', '禁用脚本'));

  renderRules();
  refreshStatus();
}

export function openSettings(): void {
  if (openPanelFn) {
    openPanelFn();
  }
}
