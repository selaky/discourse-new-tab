// 规则集合：按顺序导出，以体现优先级（后者优先）

import type { Rule } from '../decision/types';
import { topicRules } from './topic';
import { userRules } from './user';
import { attachmentRules } from './attachment';
import { popupRules } from './popup';

export function getAllRules(): Rule[] {
  // 可后续添加规则
  // 规则优先级严格按《需求文档》顺序：
  return [
    ...topicRules,
    ...userRules,
    ...attachmentRules,
    ...popupRules,
  ];
}

