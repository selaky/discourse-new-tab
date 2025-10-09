// 规则开关的持久化与默认值（中文注释）

import { gmGet, gmSet } from './gm';

// 主题帖三条细分规则的 id 常量
export const RULE_TOPIC_OPEN_NEW_TAB = 'topic:open-new-tab';
export const RULE_TOPIC_IN_TOPIC_OPEN_OTHER = 'topic:in-topic-open-other';
export const RULE_TOPIC_SAME_TOPIC_KEEP_NATIVE = 'topic:same-topic-keep-native';

// 个人主页三条细分规则
export const RULE_USER_OPEN_NEW_TAB = 'user:open-new-tab';
export const RULE_USER_IN_PROFILE_OPEN_OTHER = 'user:in-profile-open-other';
export const RULE_USER_SAME_PROFILE_KEEP_NATIVE = 'user:same-profile-keep-native';

// 附件规则
export const RULE_ATTACHMENT_KEEP_NATIVE = 'attachment:keep-native';

// 默认开关：全部启用
const DEFAULTS: Record<string, boolean> = {
  [RULE_TOPIC_OPEN_NEW_TAB]: true,
  [RULE_TOPIC_IN_TOPIC_OPEN_OTHER]: true,
  [RULE_TOPIC_SAME_TOPIC_KEEP_NATIVE]: true,
  [RULE_USER_OPEN_NEW_TAB]: true,
  [RULE_USER_IN_PROFILE_OPEN_OTHER]: true,
  [RULE_USER_SAME_PROFILE_KEEP_NATIVE]: true,
  [RULE_ATTACHMENT_KEEP_NATIVE]: true,
};

const KEY_RULES = 'ruleFlags';

export type RuleFlags = Record<string, boolean>;

export async function getRuleFlags(): Promise<RuleFlags> {
  const saved = (await gmGet<RuleFlags>(KEY_RULES, {})) || {};
  return { ...DEFAULTS, ...saved };
}

export async function getRuleEnabled(ruleId: string): Promise<boolean> {
  const flags = await getRuleFlags();
  const v = flags[ruleId];
  // 若用户从未设置，回落默认值
  return typeof v === 'boolean' ? v : (DEFAULTS[ruleId] ?? true);
}

export async function setRuleEnabled(ruleId: string, enabled: boolean): Promise<void> {
  const flags = await getRuleFlags();
  flags[ruleId] = enabled;
  await gmSet(KEY_RULES, flags);
}
