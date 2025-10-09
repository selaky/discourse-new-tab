// 个人主页相关的三条细分规则（中文注释）

import { type MatchResult, type Rule } from '../decision/types';
import { extractUsername } from '../utils/url';
import {
  RULE_USER_IN_PROFILE_OPEN_OTHER,
  RULE_USER_OPEN_NEW_TAB,
  RULE_USER_SAME_PROFILE_KEEP_NATIVE,
} from '../storage/settings';

// 小规则 1：从任意页面打开“用户个人主页”→ 新标签页
// 关闭后行为：原生
const ruleUserOpenNewTab: Rule = {
  id: RULE_USER_OPEN_NEW_TAB,
  name: '从任意页面打开个人主页：新标签页',
  enabledAction: 'new_tab',
  disabledAction: 'keep_native',
  match: (ctx): MatchResult => {
    const uname = extractUsername(ctx.targetUrl.pathname);
    if (!uname) return null;
    return { matched: true, data: { targetUser: uname } };
  },
};

// 小规则 2：在“个人主页页面内”点击“其他链接”（不是同一用户主页）→ 新标签页
// 关闭后行为：原生
const ruleInProfileOpenOther: Rule = {
  id: RULE_USER_IN_PROFILE_OPEN_OTHER,
  name: '个人主页内部点击其他链接：新标签页',
  enabledAction: 'new_tab',
  disabledAction: 'keep_native',
  match: (ctx): MatchResult => {
    const currentUser = extractUsername(ctx.currentUrl.pathname);
    if (!currentUser) return null; // 非个人主页→不匹配

    const targetUser = extractUsername(ctx.targetUrl.pathname);
    // 同一用户主页交由规则 3 处理，此处不匹配
    if (targetUser && targetUser === currentUser) return null;

    // 在个人主页内，点击到其他链接（含分类、话题、外链、其他用户主页等）
    return { matched: true, data: { currentUser, targetUser: targetUser ?? null } };
  },
};

// 小规则 3：如果目标链接与当前页面为“同一用户的主页”→ 保留原生
// 关闭后行为：新标签页
const ruleSameProfileKeepNative: Rule = {
  id: RULE_USER_SAME_PROFILE_KEEP_NATIVE,
  name: '同一用户主页：保留原生',
  enabledAction: 'keep_native',
  disabledAction: 'new_tab',
  match: (ctx): MatchResult => {
    const currentUser = extractUsername(ctx.currentUrl.pathname);
    const targetUser = extractUsername(ctx.targetUrl.pathname);
    if (!currentUser || !targetUser) return null;
    if (currentUser !== targetUser) return null;
    return { matched: true, data: { currentUser, targetUser } };
  },
};

export const userRules: Rule[] = [
  // 越靠后优先级越高（规则 3 覆盖规则 1/2）
  ruleUserOpenNewTab,
  ruleInProfileOpenOther,
  ruleSameProfileKeepNative,
];

