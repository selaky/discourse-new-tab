// 调试日志：统一出口（中文注释）

import type { DetectResult } from '../detectors/siteDetector';
import type { LinkContext, MatchResult, Action } from '../decision/types';
import type { Rule } from '../decision/types';
import { getDebugEnabled, getDebugCategories, DEBUG_LABEL, type DebugCategory } from './settings';
import type { BackgroundOpenMode } from '../storage/openMode';
import { extractTopicId, extractUsername } from '../utils/url';

// 内部帮助：判断某分类是否应该输出
async function shouldLog(category: DebugCategory): Promise<boolean> {
  const enabled = await getDebugEnabled();
  if (!enabled) return false;
  const cats = await getDebugCategories();
  return !!cats[category];
}

// 站点识别结果与信号明细
export async function logSiteDetection(result: DetectResult) {
  if (!(await shouldLog('site'))) return;
  const head = `${DEBUG_LABEL} 识别为 Discourse 站点（得分：${result.score}/${result.threshold}）`;
  const signals = result.matchedSignals
    .map((s) => `${s.name}(+${s.weight})`)
    .join(' | ');
  console.log(head + '。');
  if (signals) console.log(signals);
}

// 点击过滤原因
export async function logClickFilter(reason: string) {
  if (!(await shouldLog('click'))) return;
  console.log(`${DEBUG_LABEL} 点击事件忽略：${reason}`);
}

// 点击调试备注（用于空白区域推断等非忽略类提示）
export async function logClickNote(note: string) {
  if (!(await shouldLog('click'))) return;
  console.log(`${DEBUG_LABEL} 点击：${note}`);
}

// 链接信息（仅输出已由现有工具解析/可直接读取的信息）
export async function logLinkInfo(ctx: LinkContext) {
  if (!(await shouldLog('link'))) return;
  const current = ctx.currentUrl?.href;
  const target = ctx.targetUrl?.href;
  // 直接复用现有解析函数，避免重复实现
  const currentTopicId = extractTopicId(ctx.currentUrl.pathname);
  const targetTopicId = extractTopicId(ctx.targetUrl.pathname);
  const currentUser = extractUsername(ctx.currentUrl.pathname);
  const targetUser = extractUsername(ctx.targetUrl.pathname);
  const parts: string[] = [];
  if (currentTopicId != null) parts.push(`currentTopicId=${currentTopicId}`);
  if (targetTopicId != null) parts.push(`targetTopicId=${targetTopicId}`);
  if (currentUser) parts.push(`currentUser=${currentUser}`);
  if (targetUser) parts.push(`targetUser=${targetUser}`);
  const extra = parts.length ? `（${parts.join('，')}）` : '';
  console.log(`${DEBUG_LABEL} 链接：当前 ${current} → 目标 ${target}${extra}`);
}

// 规则细节（每条规则：开关、是否命中、动作）
export async function logRuleDetail(rule: Rule, enabled: boolean, matched: boolean, action: Action | undefined, meta?: MatchResult) {
  if (!(await shouldLog('rules'))) return;
  // 只为展示开关状态需要再次读取；此处读取不会影响决策
  const cats = await getDebugCategories(); // 占位，避免额外读；实际开关由 storage/settings 控制
  void cats;
  // 动态读取单条规则开关（不改变业务逻辑）
  const enabledText = enabled ? '开' : '关';
  const hit = matched ? '命中' : '未命中';
  const act = action ? (action === 'new_tab' ? '新标签页' : action === 'same_tab' ? '同页' : '保留原生') : '—';
  console.log(`${DEBUG_LABEL} 规则：${rule.name}（${enabledText}） → ${hit}${action ? `，动作：${act}` : ''}`);
  if (matched && meta && (meta.note || meta.data)) {
    const note = meta.note ? `说明：${meta.note}` : '';
    const data = meta.data ? `数据：${safeInline(meta.data)}` : '';
    const line = [note, data].filter(Boolean).join('；');
    if (line) console.log(`${DEBUG_LABEL} ${line}`);
  }
}

// 最终规则与动作
export async function logFinalDecision(ruleId: string, action: Action) {
  if (!(await shouldLog('final'))) return;
  const act = action === 'new_tab' ? '新标签页' : action === 'same_tab' ? '同页' : '保留原生';
  console.log(`${DEBUG_LABEL} 最终规则与动作：${ruleId} → ${act}`);
}

// 后台打开新标签页：补充日志（复用 final 分类）
export async function logBackgroundOpenApplied(mode: 'topic' | 'all') {
  if (!(await shouldLog('final'))) return;
  const m = mode === 'all' ? '全部' : '仅主题帖';
  console.log(`${DEBUG_LABEL} 后台打开：${m}`);
}

// 将对象压缩为简短的内联文本
function safeInline(obj: Record<string, any>): string {
  const parts: string[] = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v == null) continue;
    parts.push(`${k}=${String(v)}`);
  }
  return parts.join(', ');
}

// 错误上报（按分类受控）
export async function logError(category: DebugCategory, message: string, err?: unknown) {
  if (!(await shouldLog(category))) return;
  console.error(`${DEBUG_LABEL} 错误：${message}`, err);
}

// —— 后台打开（浮球）专栏 ——
export async function logBgBallVisibility(visible: boolean) {
  if (!(await shouldLog('bg'))) return;
  console.log(`${DEBUG_LABEL} 悬浮球：${visible ? '显示' : '隐藏'}`);
}

export async function logBgModeChange(mode: BackgroundOpenMode, source: 'ball' | 'settings') {
  if (!(await shouldLog('bg'))) return;
  const m = mode === 'all' ? '全部' : mode === 'topic' ? '仅主题帖' : '无';
  const s = source === 'ball' ? '悬浮球' : '设置';
  console.log(`${DEBUG_LABEL} 后台打开切换（${s}）：${m}`);
}
