// 点击监听与统一跳转处理

import { evaluateRules } from '../decision/engine';
import type { LinkContext } from '../decision/types';
import { getAllRules } from '../rules';
import { toAbsoluteUrl } from '../utils/url';
import { logClickFilter, logFinalDecision, logLinkInfo, logBackgroundOpenApplied, logError } from '../debug/logger';
import { isInSearchResults, resolveSearchResultLink } from '../utils/dom';
import { getBackgroundOpenMode } from '../storage/openMode';
import { openNewTabBackground, openNewTabForeground } from '../utils/open';
import { extractTopicId } from '../utils/url';

function isPlainLeftClick(ev: MouseEvent): boolean {
  return ev.button === 0 && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && !ev.altKey;
}

// 避免跨 realm instanceof 问题，使用 tagName 判断
function findAnchor(el: EventTarget | null): HTMLAnchorElement | null {
  let node = el as Node | null;
  while (node) {
    // 类型判断和属性检查
    const elem = node as HTMLElement;
    if (elem && elem.tagName === 'A') return elem as HTMLAnchorElement;
    node = (elem && elem.parentElement) ? elem.parentElement : null;
  }
  return null;
}

export function attachClickListener(label: string = '[discourse-new-tab]') {
  const handler = async (ev: MouseEvent) => {
    try {
      if (!isPlainLeftClick(ev)) {
        await logClickFilter('非左键或组合键点击');
        return; // 尊重 Ctrl/Meta/中键等用户意图
      }

      const a = findAnchor(ev.target);
      if (!a) { await logClickFilter('未找到 <a> 元素'); return; }
      // 容错：搜索结果弹窗中可能存在无 href 的 <a>，通过 data-xxx 或 topic id 推断 URL
      let rawHref = a.getAttribute('href') || a.href || '';
      if (!rawHref || rawHref === '#') {
        if (isInSearchResults(a)) {
          const fallback = resolveSearchResultLink(a);
          if (fallback) rawHref = fallback;
        }
      }
      if (!rawHref) { await logClickFilter('链接无 href'); return; }
      if (a.hasAttribute('download')) { await logClickFilter('下载链接'); return; } // 下载链接不拦截
      if (a.getAttribute('data-dnt-ignore') === '1') { await logClickFilter('显式忽略标记 data-dnt-ignore=1'); return; } // 提供逃生阀
      const targetUrl = toAbsoluteUrl(rawHref, location.href);
      if (!targetUrl) { await logClickFilter('目标 URL 解析失败'); return; }

      const ctx: LinkContext = { anchor: a, targetUrl, currentUrl: new URL(location.href) };
      await logLinkInfo(ctx);
      const decision = await evaluateRules(getAllRules(), ctx);

      if (decision.action === 'new_tab') {
        // 新标签页打开，并强力阻止原页面的任何进一步处理
        ev.preventDefault();
        ev.stopImmediatePropagation();
        ev.stopPropagation();

        // 二次判定：是否按用户设置后台打开
        try {
          const mode = await getBackgroundOpenMode();
          const isTopic = extractTopicId(targetUrl.pathname) != null;
          const useBg = (mode === 'all') || (mode === 'topic' && isTopic);
          if (useBg) {
            openNewTabBackground(targetUrl.href);
            a.setAttribute('data-dnt-handled', '1');
            await logFinalDecision(decision.ruleId, decision.action);
            await logBackgroundOpenApplied(mode === 'all' ? 'all' : 'topic');
            return; // 终止后续处理
          }
        } catch (err) {
          await logError('click', '读取后台打开设置失败，降级为前台', err);
        }

        // 默认前台新标签（与原逻辑一致）
        openNewTabForeground(targetUrl.href); // 避免 opener 泄漏
        a.setAttribute('data-dnt-handled', '1');
        await logFinalDecision(decision.ruleId, decision.action);
        return; // 终止后续处理
      } else if (decision.action === 'same_tab') {
        // 预留：目前未使用，未来可用作“强制同页打开”
        // ev.preventDefault(); location.assign(targetUrl.href);
        await logFinalDecision(decision.ruleId, decision.action);
      } else {
        // keep_native：保持原生，什么都不做
        await logFinalDecision(decision.ruleId, decision.action);
      }
    } catch (err) {
      await logError('click', '点击处理异常', err);
    }
  };

  // 捕获阶段尽早拦截，降低站点脚本先行处理的概率
  document.addEventListener('click', handler, true);
}
