/**
 * 论坛识别模块：尽量精准地识别 Discourse 站点
 * 设计目标：
 * - 多信号组合：强弱信号加权，避免单点误判
 * - 性能友好：只做少量 DOM 查询与字符串判断
 * - 可扩展：后续可继续增加/调整信号与权重
 */

import { logError } from '../debug/logger';

export type DetectResult = {
  isDiscourse: boolean;
  score: number;
  threshold: number;
  matchedSignals: { name: string; weight: number; note?: string }[];
};

type Signal = {
  name: string;
  weight: number;
  matched: boolean;
  note?: string;
};

/** 阈值设计：≥ 3 认为是 Discourse。强信号（3 分）或多个弱信号组合（1+1+1）均可命中。 */
const THRESHOLD = 3;

export function detectDiscourse(doc: Document = document, win: Window = window): DetectResult {
  const url = win.location?.href || '';

  const signals: Signal[] = [
    // 强信号：meta generator 包含 Discourse（官方默认输出）
    metaGeneratorSignal(doc),
    // 强信号：窗口上暴露 Discourse 对象（不少站点保留）
    windowDiscourseSignal(win),
    // 中等信号：常见的 Discourse 专用 meta
    metaDiscourseSpecificSignal(doc),
    // 中等信号：常见的 DOM 结构（保守选择）
    domStructureSignal(doc),
    // 弱信号：URL 路径包含 Discourse 常见路由段
    urlPathPatternSignal(url),
  ];

  const matchedSignals = signals
    .filter((s) => s.matched)
    .map(({ name, weight, note }) => ({ name, weight, note }));

  const score = matchedSignals.reduce((sum, s) => sum + s.weight, 0);
  const isDiscourse = score >= THRESHOLD;

  return { isDiscourse, score, threshold: THRESHOLD, matchedSignals };
}

export function isDiscourseSite(): boolean {
  try {
    return detectDiscourse().isDiscourse;
  } catch (err) {
    // 调试：识别过程异常
    void logError('site', '站点识别失败', err);
    return false;
  }
}

// ----------------- 各类信号实现 -----------------

function metaGeneratorSignal(doc: Document): Signal {
  try {
    const meta = doc.querySelector('meta[name="generator"]') as HTMLMetaElement | null;
    const content = meta?.content?.toLowerCase?.() || '';
    const matched = content.includes('discourse');
    return { name: 'meta:generator=Discourse', weight: 3, matched, note: content || undefined };
  } catch (err) {
    void logError('site', '读取 meta[name="generator"] 失败', err);
    return { name: 'meta:generator=Discourse', weight: 3, matched: false };
  }
}

function windowDiscourseSignal(win: Window): Signal {
  try {
    // 仅做存在性探测，不访问内部字段以避免异常
    const matched = typeof (win as any).Discourse !== 'undefined';
    return { name: 'window.Discourse 存在', weight: 3, matched };
  } catch (err) {
    void logError('site', '探测 window.Discourse 失败', err);
    return { name: 'window.Discourse 存在', weight: 3, matched: false };
  }
}

function metaDiscourseSpecificSignal(doc: Document): Signal {
  try {
    const metas = Array.from(doc.querySelectorAll('meta[name]')) as HTMLMetaElement[];
    const names = metas.map((m) => m.getAttribute('name') || '');
    const hasDiscourseMeta = names.some((n) => n.startsWith('discourse_'))
      || !!doc.querySelector('meta[name="application-name"][content*="Discourse" i]');
    return { name: 'meta:discourse_* 或 application-name=Discourse', weight: 2, matched: !!hasDiscourseMeta };
  } catch (err) {
    void logError('site', '读取 Discourse 相关 meta 失败', err);
    return { name: 'meta:discourse_* 或 application-name=Discourse', weight: 2, matched: false };
  }
}

function domStructureSignal(doc: Document): Signal {
  try {
    // 选择较为稳妥的结构：#main-outlet 或 .topic-list（Discourse 常见）
    const matched = !!(
      doc.getElementById('main-outlet') ||
      doc.querySelector('.topic-list') ||
      doc.querySelector('meta[property="og:site_name"]')
    );
    return { name: 'DOM: #main-outlet/.topic-list/og:site_name', weight: 2, matched };
  } catch (err) {
    void logError('site', '检查 DOM 结构失败', err);
    return { name: 'DOM: #main-outlet/.topic-list/og:site_name', weight: 2, matched: false };
  }
}

function urlPathPatternSignal(url: string): Signal {
  try {
    const u = new URL(url);
    const p = u.pathname.toLowerCase();
    const patterns = ['/t/', '/u/', '/c/', '/tags', '/latest', '/top'];
    const matched = patterns.some((s) => p.includes(s));
    return { name: 'URL 路径包含 Discourse 常见段', weight: 1, matched, note: p };
  } catch (err) {
    void logError('site', 'URL 解析失败', err);
    return { name: 'URL 路径包含 Discourse 常见段', weight: 1, matched: false };
  }
}

