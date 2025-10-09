// 规则决策引擎：按顺序评估规则，后者优先（命中则覆盖之前结果）

import { type Decision, type LinkContext, type Rule } from './types';
import { getRuleEnabled } from '../storage/settings';

// 评估一组规则，返回最终动作。
export async function evaluateRules(rules: Rule[], ctx: LinkContext): Promise<Decision> {
  let lastDecision: Decision | null = null;

  for (const rule of rules) {
    let match: ReturnType<Rule['match']> = null;
    try {
      match = rule.match(ctx);
    } catch {}

    if (!match) continue; // 不匹配→跳过，符合“单条规则不匹配返回 null”

    // 命中后，根据开关状态决定动作
    const enabled = await getRuleEnabled(rule.id);
    const action = enabled ? rule.enabledAction : rule.disabledAction;

    lastDecision = {
      action,
      ruleId: rule.id,
      debug: { ruleName: rule.name, note: match.note, data: match.data },
    };
    // 不提前返回，确保“靠后优先级更高”
  }

  // 所有规则均不匹配→保留原生
  if (!lastDecision) {
    return { action: 'keep_native', ruleId: 'default' };
  }
  return lastDecision;
}

