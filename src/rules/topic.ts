// 主题帖相关的三条细分规则（中文注释）

import { type MatchResult, type Rule } from '../decision/types';
import { extractTopicId, toAbsoluteUrl } from '../utils/url';
import {
  RULE_TOPIC_IN_TOPIC_OPEN_OTHER,
  RULE_TOPIC_OPEN_NEW_TAB,
  RULE_TOPIC_SAME_TOPIC_KEEP_NATIVE,
} from '../storage/settings';

// 小规则 1：从任意页面打开“主题帖链接”→ 新标签页
// 关闭后行为：原生
const ruleTopicOpenNewTab: Rule = {
  id: RULE_TOPIC_OPEN_NEW_TAB,
  name: '从任意页面打开主题帖：新标签页',
  enabledAction: 'new_tab',
  disabledAction: 'keep_native',
  match: (ctx): MatchResult => {
    const tId = extractTopicId(ctx.targetUrl.pathname);
    if (tId == null) return null;
    return { matched: true, data: { targetTopicId: tId } };
  },
};

// 小规则 2：在“主题帖页面内”点击“其他链接”（不是本主题楼层跳转）→ 新标签页
// 关闭后行为：原生
const ruleInTopicOpenOther: Rule = {
  id: RULE_TOPIC_IN_TOPIC_OPEN_OTHER,
  name: '主题帖内部点击其他链接：新标签页',
  enabledAction: 'new_tab',
  disabledAction: 'keep_native',
  match: (ctx): MatchResult => {
    // 当前页面是否是主题帖
    const currentTopicId = extractTopicId(ctx.currentUrl.pathname);
    if (currentTopicId == null) return null; // 非主题页→此规则不匹配

    // 目标是否“同主题页内跳转”？若是，则本规则不匹配（由规则 3 处理）
    const targetTopicId = extractTopicId(ctx.targetUrl.pathname);
    if (targetTopicId && targetTopicId === currentTopicId) return null;

    // 走到这里：在主题帖页面内，点击的是“其他链接”（包括其他主题、分类、外链等）
    return { matched: true, data: { currentTopicId, targetTopicId: targetTopicId ?? null } };
  },
};

// 小规则 3：如果目标链接与当前页面为“同一主题帖”（通常为楼层跳转）→ 保留原生
// 关闭后行为：新标签页
const ruleSameTopicKeepNative: Rule = {
  id: RULE_TOPIC_SAME_TOPIC_KEEP_NATIVE,
  name: '同一主题内楼层跳转：保留原生',
  enabledAction: 'keep_native',
  disabledAction: 'new_tab',
  match: (ctx): MatchResult => {
    const currentTopicId = extractTopicId(ctx.currentUrl.pathname);
    const targetTopicId = extractTopicId(ctx.targetUrl.pathname);
    if (currentTopicId == null || targetTopicId == null) return null;
    if (currentTopicId !== targetTopicId) return null;
    return {
      matched: true,
      note: '同一主题编号（常见为楼层跳转）',
      data: { currentTopicId, targetTopicId },
    };
  },
};

export const topicRules: Rule[] = [
  // 越靠后优先级越高（规则 3 覆盖规则 1/2）
  ruleTopicOpenNewTab,
  ruleInTopicOpenOther,
  ruleSameTopicKeepNative,
];

