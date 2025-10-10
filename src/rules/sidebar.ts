// 侧边栏相关的两条细分规则（中文注释）

import { type MatchResult, type Rule } from '../decision/types';
import { extractTopicId } from '../utils/url';
import { isInSidebar } from '../utils/dom';
import {
  RULE_SIDEBAR_IN_TOPIC_NEW_TAB,
  RULE_SIDEBAR_NON_TOPIC_KEEP_NATIVE,
} from '../storage/settings';

// 小规则 1：非主题帖内，侧边栏链接 → 保留原生
// 关闭后行为：新标签页
const ruleSidebarNonTopicKeepNative: Rule = {
  id: RULE_SIDEBAR_NON_TOPIC_KEEP_NATIVE,
  name: '非主题页-侧边栏链接：保留原生',
  enabledAction: 'keep_native',
  disabledAction: 'new_tab',
  match: (ctx): MatchResult => {
    const a = ctx.anchor;
    if (!a) return null;
    if (!isInSidebar(a)) return null;
    const currentTopicId = extractTopicId(ctx.currentUrl.pathname);
    if (currentTopicId != null) return null; // 主题页由规则 2 处理
    return { matched: true, note: '非主题页的侧边栏链接' };
  },
};

// 小规则 2：主题帖内，侧边栏链接 → 新标签页
// 关闭后行为：保留原生
const ruleSidebarInTopicNewTab: Rule = {
  id: RULE_SIDEBAR_IN_TOPIC_NEW_TAB,
  name: '主题页-侧边栏链接：新标签页',
  enabledAction: 'new_tab',
  disabledAction: 'keep_native',
  match: (ctx): MatchResult => {
    const a = ctx.anchor;
    if (!a) return null;
    if (!isInSidebar(a)) return null;
    const currentTopicId = extractTopicId(ctx.currentUrl.pathname);
    if (currentTopicId == null) return null; // 非主题页由规则 1 处理
    return { matched: true, note: '主题页内的侧边栏链接', data: { currentTopicId } };
  },
};

export const sidebarRules: Rule[] = [
  // 顺序与《需求文档》一致：非主题页→保留原生；主题页→新标签
  ruleSidebarNonTopicKeepNative,
  ruleSidebarInTopicNewTab,
];

