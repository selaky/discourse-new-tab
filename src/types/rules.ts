export type PageKind = 'topic' | 'category' | 'user' | 'homepage' | 'search' | 'external' | 'unknown';

export interface PageContext {
  kind: PageKind;
  topicId?: string;
  rawUrl: URL;
}

export interface RuleEvaluationInput {
  current: PageContext;
  target: PageContext;
  anchor: HTMLAnchorElement;
  config: import('./config').RuleSwitches;
  isAttachment: boolean;
  isPopupLike: boolean;
}

export interface RuleDecision {
  openInNewTab: boolean;
  reason: string;
}