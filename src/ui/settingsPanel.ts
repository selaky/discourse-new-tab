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
#dnt-settings-toggle {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 2147483000;
  background: #5662f6;
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
#dnt-settings-toggle:hover {
  background: #3f4de6;
}
.dnt-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 25, 45, 0.55);
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
  width: 360px;
  max-width: 100%;
  max-height: 85vh;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}
.dnt-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
}
.dnt-panel__header h2 {
  margin: 0;
  font-size: 16px;
}
.dnt-panel__close {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #555;
}
.dnt-panel__content {
  padding: 16px 18px 20px;
  overflow-y: auto;
  flex: 1;
}
.dnt-section + .dnt-section {
  margin-top: 18px;
}
.dnt-section h3 {
  margin: 0 0 10px;
  font-size: 14px;
}
.dnt-rule-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}
.dnt-rule-item label {
  font-size: 13px;
  font-weight: 600;
}
.dnt-rule-item span {
  font-size: 12px;
  color: #5f6272;
  display: block;
}
.dnt-lists {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dnt-list-block {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 12px;
}
.dnt-list-block header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.dnt-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 120px;
  overflow-y: auto;
}
.dnt-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}
.dnt-list li:last-child {
  border-bottom: none;
}
.dnt-list button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #4453d8;
  font-size: 12px;
  padding: 0 4px;
}
.dnt-list-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.dnt-add-form {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.dnt-add-form input {
  flex: 1;
  padding: 6px 8px;
  font-size: 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}
.dnt-add-form button {
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.dnt-add {
  background: #4453d8;
  color: #fff;
}
.dnt-cancel {
  background: #dadff5;
  color: #323968;
}
.dnt-status {
  font-size: 12px;
  border-radius: 8px;
  padding: 10px 12px;
  background: #f4f7ff;
  color: #36417e;\n  line-height: 1.5;\n  white-space: pre-line;\n}
`; // end STYLE

const RULE_TEXT: Record<keyof RuleSwitches, { label: string; hint: string }> = {
  enableTopicNewTab: {
    label: '帖子相关统一用新标签打开',
    hint: '页面或链接任一属于帖子时，在新标签页打开'
  },
  keepSameTopicInTab: {
    label: '同帖内部跳转保持当前标签',
    hint: '相同帖子内的楼层跳转不改变窗口'
  },
  keepNonTopicDefault: {
    label: '非帖子页面维持网站默认',
    hint: '分类、用户等非帖子页面使用默认行为'
  },
  skipAttachments: {
    label: '附件类链接不改写',
    hint: '图片、压缩包等附件使用默认下载/预览'
  },
  skipPopupLike: {
    label: '弹窗行为不变更',
    hint: '按钮式或弹窗链接保持原始交互'
  }
};

export function initSettingsPanel(options: InitOptions): void {
  if (document.getElementById('dnt-settings-toggle')) {
    return;
  }

  const { configManager, activation, host } = options;

  injectStyles(STYLE);

  const toggleButton = document.createElement('button');
  toggleButton.id = 'dnt-settings-toggle';
  toggleButton.type = 'button';
  toggleButton.textContent = 'Discourse 新标签设置';

  const overlay = document.createElement('div');
  overlay.className = 'dnt-overlay';

  const panel = document.createElement('div');
  panel.className = 'dnt-panel';

  const header = document.createElement('div');
  header.className = 'dnt-panel__header';

  const title = document.createElement('h2');
  title.textContent = '新标签页偏好设置';
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
  rulesTitle.textContent = '规则开关';
  rulesSection.appendChild(rulesTitle);
  const rulesContainer = document.createElement('div');
  rulesSection.appendChild(rulesContainer);
  content.appendChild(rulesSection);

  const listsSection = document.createElement('section');
  listsSection.className = 'dnt-section';
  const listsTitle = document.createElement('h3');
  listsTitle.textContent = '白名单与黑名单';
  listsSection.appendChild(listsTitle);
  const listsWrapper = document.createElement('div');
  listsWrapper.className = 'dnt-lists';
  listsSection.appendChild(listsWrapper);
  content.appendChild(listsSection);

  panel.appendChild(header);
  panel.appendChild(content);
  overlay.appendChild(panel);
  document.body.appendChild(toggleButton);
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
      label.textContent = RULE_TEXT[key].label;

      const hint = document.createElement('span');
      hint.textContent = RULE_TEXT[key].hint;
      label.appendChild(hint);

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
    input.placeholder = '例如: meta.appinn.net';
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
      empty.textContent = '暂无数据';
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
    const snapshot = configManager.getSnapshot(host);
    const lines: string[] = [];
    lines.push(`当前域名: ${host}`);
    if (isBlacklisted) {
      lines.push('状态: 黑名单（脚本停用）');
    } else if (isWhitelisted) {
      lines.push('状态: 白名单（强制启用脚本）');
    } else {
      lines.push(`状态: ${activation.reason === 'auto-detected' ? '自动识别已启用' : '根据规则启用'}`);
    }
    lines.push('规则生效概览:');
    (Object.keys(snapshot.domainRules) as Array<keyof RuleSwitches>).forEach((key) => {
      lines.push(`${RULE_TEXT[key].label}: ${snapshot.domainRules[key] ? '开' : '关'}`);
    });
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

  toggleButton.addEventListener('click', () => {
    if (overlay.classList.contains('is-open')) {
      closePanel();
    } else {
      openPanel();
    }
  });

  closeButton.addEventListener('click', () => {
    closePanel();
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closePanel();
    }
  });

  listsWrapper.appendChild(buildListBlock('whitelist', '白名单', '强制启用脚本的域名'));
  listsWrapper.appendChild(buildListBlock('blacklist', '黑名单', '屏蔽脚本的域名'));

  renderRules();
  refreshStatus();
}