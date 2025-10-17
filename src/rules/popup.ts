// 弹窗规则：用户卡片、用户菜单（统一大开关；启用=按需求重定向，禁用=全部保留原生）

import type { MatchResult, Rule } from '../decision/types';
import {
  RULE_POPUP_USER_CARD,
  RULE_POPUP_USER_MENU,
  RULE_POPUP_SEARCH_MENU,
} from '../storage/settings';
import {
  isActiveTab,
  isInUserCard,
  isInUserMenu,
  isInUserMenuNav,
  isUserCardTrigger,
  isUserMenuTrigger,
  isInSearchResults,
  isSearchResultMoreLink,
  isSearchResultTopicLink,
} from '../utils/dom';

// ——— 用户卡片 ———

// 1) 触发卡片的链接：保留原生（启用时用于覆盖“个人主页=新标签”的规则）
const ruleUserCardTriggerKeepNative: Rule = {
  id: RULE_POPUP_USER_CARD,
  name: '用户卡片：触发链接=保留原生',
  enabledAction: 'keep_native',
  disabledAction: 'keep_native', // 关闭时也保留原生
  match: (ctx): MatchResult => {
    const a = ctx.anchor;
    if (!a) return null;
    if (isUserCardTrigger(a) && !isInUserCard(a)) {
      return { matched: true, note: '用户卡片触发链接' };
    }
    return null;
  },
};

// 2) 卡片内任意链接：新标签（启用）；关闭：保留原生
const ruleUserCardInsideNewTab: Rule = {
  id: RULE_POPUP_USER_CARD,
  name: '用户卡片：卡片内链接=新标签',
  enabledAction: 'new_tab',
  disabledAction: 'keep_native',
  match: (ctx): MatchResult => {
    const a = ctx.anchor;
    if (!a) return null;
    if (isInUserCard(a)) {
      return { matched: true, note: '用户卡片内链接' };
    }
    return null;
  },
};

// ——— 用户菜单 ———

// 1) 触发菜单的链接：保留原生（启用时覆盖“个人主页=新标签”的规则）
const ruleUserMenuTriggerKeepNative: Rule = {
  id: RULE_POPUP_USER_MENU,
  name: '用户菜单：触发链接=保留原生',
  enabledAction: 'keep_native',
  disabledAction: 'keep_native',
  match: (ctx): MatchResult => {
    const a = ctx.anchor;
    if (!a) return null;
    if (isUserMenuTrigger(a) && !isInUserMenu(a)) {
      return { matched: true, note: '用户菜单触发链接' };
    }
    return null;
  },
};

// 2) 菜单导航区：未激活=保留原生（切换面板）；激活状态再点=新标签
const ruleUserMenuNavKeepOrNew: Rule = {
  id: RULE_POPUP_USER_MENU,
  name: '用户菜单：导航区点击（激活=新标签/未激活=原生）',
  enabledAction: 'keep_native', // 默认保留原生，下面在激活情况下用后置规则覆盖
  disabledAction: 'keep_native',
  match: (ctx): MatchResult => {
    const a = ctx.anchor;
    if (!a) return null;
    if (!isInUserMenu(a)) return null;
    if (!isInUserMenuNav(a)) return null;
    // 未激活：保留原生（返回匹配，action=keep_native）
    if (!isActiveTab(a)) {
      return { matched: true, note: '用户菜单导航（未激活）' };
    }
    return null; // 激活情况留给下条规则处理
  },
};

// 3) 菜单导航区：激活项再次点击=新标签
const ruleUserMenuNavActiveNewTab: Rule = {
  id: RULE_POPUP_USER_MENU,
  name: '用户菜单：导航区激活项=新标签',
  enabledAction: 'new_tab',
  disabledAction: 'keep_native',
  match: (ctx): MatchResult => {
    const a = ctx.anchor;
    if (!a) return null;
    if (!isInUserMenu(a)) return null;
    if (!isInUserMenuNav(a)) return null;
    if (isActiveTab(a)) {
      return { matched: true, note: '用户菜单导航（激活）' };
    }
    return null;
  },
};

// 4) 菜单内容区任意链接：新标签（启用）；关闭：保留原生
const ruleUserMenuContentNewTab: Rule = {
  id: RULE_POPUP_USER_MENU,
  name: '用户菜单：内容区链接=新标签',
  enabledAction: 'new_tab',
  disabledAction: 'keep_native',
  match: (ctx): MatchResult => {
    const a = ctx.anchor;
    if (!a) return null;
    if (!isInUserMenu(a)) return null;
    if (isInUserMenuNav(a)) return null; // 导航由上两条处理
    return { matched: true, note: '用户菜单内容区链接' };
  },
};

export const popupRules: Rule[] = [
  // 用户卡片（触发→保留；卡片内→新标签）
  ruleUserCardTriggerKeepNative,
  ruleUserCardInsideNewTab,
  // 用户菜单（触发→保留；导航未激活→保留；导航激活→新标签；内容区→新标签）
  ruleUserMenuTriggerKeepNative,
  ruleUserMenuNavKeepOrNew,
  ruleUserMenuNavActiveNewTab,
  ruleUserMenuContentNewTab,
  // 搜索弹窗（结果列表与底部“更多”按钮 → 新标签；其余保持原生）
  // 说明：搜索历史、建议项等（不在结果区内）一律不改写。
  {
    id: RULE_POPUP_SEARCH_MENU,
    name: '搜索弹窗：结果与“更多”=新标签',
    enabledAction: 'new_tab',
    disabledAction: 'keep_native',
    match: (ctx): MatchResult => {
      const a = ctx.anchor;
      if (!a) return null;
      if (!isInSearchResults(a)) return null;
      // 使用 targetUrl 判定，兼容无 href 的结果项
      const p = ctx.targetUrl?.pathname || '';
      if (/\/t\//.test(p) || p.startsWith('/search')) {
        return { matched: true, note: '搜索弹窗结果或更多' };
      }
      return null;
    },
  },
];

