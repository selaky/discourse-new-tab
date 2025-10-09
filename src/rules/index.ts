// 规则集合：按顺序导出，以体现优先级（后者优先）

import type { Rule } from '../decision/types';
import { topicRules } from './topic';
import { userRules } from './user';
import { attachmentRules } from './attachment';
import { popupRules } from './popup';

export function getAllRules(): Rule[] {
  // 未来可在此按模块拼接更多规则（用户主页、附件、弹窗等）
  return [
    ...topicRules,
    ...userRules,
    ...popupRules,
    // 将附件规则放在最后，确保其“保留原生”可覆盖前面的“新标签”判定
    ...attachmentRules,
  ];
}
