// 跳转规则区域
import { getRuleFlags, setRuleEnabled } from '../../storage/settings';
import {
  RULE_TOPIC_OPEN_NEW_TAB,
  RULE_TOPIC_IN_TOPIC_OPEN_OTHER,
  RULE_TOPIC_SAME_TOPIC_KEEP_NATIVE,
  RULE_USER_OPEN_NEW_TAB,
  RULE_USER_IN_PROFILE_OPEN_OTHER,
  RULE_USER_SAME_PROFILE_KEEP_NATIVE,
  RULE_ATTACHMENT_KEEP_NATIVE,
  RULE_POPUP_USER_CARD,
  RULE_POPUP_USER_MENU,
  RULE_POPUP_SEARCH_MENU,
  RULE_POPUP_CHAT_WINDOW,
  RULE_SIDEBAR_NON_TOPIC_KEEP_NATIVE,
  RULE_SIDEBAR_IN_TOPIC_NEW_TAB,
} from '../../storage/settings';
import { t } from '../i18n';

interface RuleGroup {
  title: string;
  rules: Array<{ id: string; label: string }>;
}

const RULE_GROUPS: RuleGroup[] = [
  {
    title: 'settings.rules.topic.title',
    rules: [
      { id: RULE_TOPIC_OPEN_NEW_TAB, label: 'settings.rules.topic.openNewTab' },
      { id: RULE_TOPIC_IN_TOPIC_OPEN_OTHER, label: 'settings.rules.topic.inTopicOpenOther' },
      { id: RULE_TOPIC_SAME_TOPIC_KEEP_NATIVE, label: 'settings.rules.topic.sameTopicKeepNative' },
    ],
  },
  {
    title: 'settings.rules.user.title',
    rules: [
      { id: RULE_USER_OPEN_NEW_TAB, label: 'settings.rules.user.openNewTab' },
      { id: RULE_USER_IN_PROFILE_OPEN_OTHER, label: 'settings.rules.user.inProfileOpenOther' },
      { id: RULE_USER_SAME_PROFILE_KEEP_NATIVE, label: 'settings.rules.user.sameProfileKeepNative' },
    ],
  },
  {
    title: 'settings.rules.attachment.title',
    rules: [{ id: RULE_ATTACHMENT_KEEP_NATIVE, label: 'settings.rules.attachment.keepNative' }],
  },
  {
    title: 'settings.rules.popup.title',
    rules: [
      { id: RULE_POPUP_USER_CARD, label: 'settings.rules.popup.userCard' },
      { id: RULE_POPUP_USER_MENU, label: 'settings.rules.popup.userMenu' },
      { id: RULE_POPUP_SEARCH_MENU, label: 'settings.rules.popup.searchMenu' },
      { id: RULE_POPUP_CHAT_WINDOW, label: 'settings.rules.popup.chatWindowNative' },
    ],
  },
  {
    title: 'settings.rules.sidebar.title',
    rules: [
      { id: RULE_SIDEBAR_NON_TOPIC_KEEP_NATIVE, label: 'settings.rules.sidebar.nonTopicKeepNative' },
      { id: RULE_SIDEBAR_IN_TOPIC_NEW_TAB, label: 'settings.rules.sidebar.inTopicNewTab' },
    ],
  },
];

export function renderRulesSection(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'dnt-section';

  const title = document.createElement('h3');
  title.className = 'dnt-section-title';
  title.textContent = t('settings.rules.title');
  section.appendChild(title);

  const content = document.createElement('div');
  content.className = 'dnt-rules-content';

  (async () => {
    const flags = await getRuleFlags();

    RULE_GROUPS.forEach((group) => {
      const groupBlock = document.createElement('div');
      groupBlock.className = 'dnt-rule-group';

      const groupTitle = document.createElement('h4');
      groupTitle.className = 'dnt-rule-group-title';
      groupTitle.textContent = t(group.title);
      groupBlock.appendChild(groupTitle);

      group.rules.forEach((rule) => {
        const ruleItem = createRuleItem(rule.id, t(rule.label), flags[rule.id] ?? true);
        groupBlock.appendChild(ruleItem);
      });

      content.appendChild(groupBlock);
    });
  })();

  section.appendChild(content);

  return section;
}

function createRuleItem(ruleId: string, label: string, enabled: boolean): HTMLElement {
  const item = document.createElement('div');
  item.className = 'dnt-rule-item';

  const labelEl = document.createElement('label');
  labelEl.className = 'dnt-rule-label';
  labelEl.textContent = label;

  const toggle = createToggle(ruleId, enabled);

  item.appendChild(labelEl);
  item.appendChild(toggle);

  return item;
}

function createToggle(ruleId: string, enabled: boolean): HTMLElement {
  const toggle = document.createElement('div');
  toggle.className = `dnt-toggle ${enabled ? 'dnt-toggle-on' : 'dnt-toggle-off'}`;
  toggle.setAttribute('data-rule-id', ruleId);

  const track = document.createElement('div');
  track.className = 'dnt-toggle-track';

  const thumb = document.createElement('div');
  thumb.className = 'dnt-toggle-thumb';

  track.appendChild(thumb);
  toggle.appendChild(track);

  toggle.addEventListener('click', async () => {
    const currentState = toggle.classList.contains('dnt-toggle-on');
    const newState = !currentState;

    await setRuleEnabled(ruleId, newState);

    toggle.classList.remove('dnt-toggle-on', 'dnt-toggle-off');
    toggle.classList.add(newState ? 'dnt-toggle-on' : 'dnt-toggle-off');
  });

  return toggle;
}
