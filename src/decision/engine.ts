// 规则决策引擎：按顺序评估规则，后者优先（命中则覆盖之前结果）

import { type Decision, type LinkContext, type Rule } from './types';
import { getRuleEnabled } from '../storage/settings';
import { logRuleDetail } from '../debug/logger';

// 评估一组规则，返回最终动作。
export async function evaluateRules(rules: Rule[], ctx: LinkContext): Promise<Decision> {
  let lastDecision: Decision | null = null;

  for (const rule of rules) {
    let match: ReturnType<Rule['match']> = null;
    try {
      match = rule.match(ctx);
    } catch {}

    // 读取开关状态用于调试输出（不会影响业务逻辑）
    const enabled = await getRuleEnabled(rule.id);

    if (!match) {
      // 调试：未命中
      await logRuleDetail(rule, enabled, false, undefined, undefined);
      continue; // 不匹配→跳过
    }

    // 命中后，根据开关状态决定动作
    const action = enabled ? rule.enabledAction : rule.disabledAction;

    lastDecision = {
      action,
      ruleId: rule.id,
    };
    // 调试：命中规则细节
    await logRuleDetail(rule, enabled, true, action, match);
    // 不提前返回，确保“靠后优先级更高”
  }

  // 所有规则均不匹配→保留原生
  if (!lastDecision) {
    return { action: 'keep_native', ruleId: 'default' };
  }
  return lastDecision;
}

