// 附件规则（中文注释）

import { type MatchResult, type Rule } from '../decision/types';
import { isLikelyAttachment } from '../utils/url';
import { RULE_ATTACHMENT_KEEP_NATIVE } from '../storage/settings';

// 打开附件（图片/文件等）→ 保留原生
// 关闭后行为：新标签页
const ruleAttachmentKeepNative: Rule = {
  id: RULE_ATTACHMENT_KEEP_NATIVE,
  name: '附件链接：保留原生',
  enabledAction: 'keep_native',
  disabledAction: 'new_tab',
  match: (ctx): MatchResult => {
    const p = ctx.targetUrl.pathname || '';
    if (!isLikelyAttachment(p)) return null;
    return { matched: true, data: { pathname: p } };
  },
};

export const attachmentRules: Rule[] = [ruleAttachmentKeepNative];

