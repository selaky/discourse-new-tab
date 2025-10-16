// 规则与决策系统的公共类型定义（中文注释）

export type Action = 'new_tab' | 'keep_native' | 'same_tab';

// 链接上下文：点击时可用的必要信息
export interface LinkContext {
  // 触发点击的 <a> 元素
  anchor: HTMLAnchorElement;
  // 目标 URL（已标准化为绝对 URL）
  targetUrl: URL;
  // 当前页面 URL
  currentUrl: URL;
}

// 规则匹配结果（用于说明命中原因）
export interface MatchMeta {
  matched: true;
  note?: string;
  // 可选携带的解析信息（例如主题 id）
  data?: Record<string, any>;
}

export type MatchResult = MatchMeta | null;

// 单条规则定义：不匹配返回 null；匹配后根据开关产出动作
export interface Rule {
  id: string; // 唯一标识，用于存储开关
  name: string; // 规则名称
  // 规则匹配逻辑：必须保证不匹配时返回 null
  match: (ctx: LinkContext) => MatchResult;
  // 规则启用时的缺省动作
  enabledAction: Action;
  // 规则关闭时的动作
  disabledAction: Action;
}

export interface Decision {
  action: Action;
  // 命中的规则 id（未命中任何规则时可为 'default'）
  ruleId: string;}

