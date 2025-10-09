// 点击监听与统一跳转处理（中文注释）

import { evaluateRules } from '../decision/engine';
import type { LinkContext } from '../decision/types';
import { getAllRules } from '../rules';
import { toAbsoluteUrl } from '../utils/url';

function isPlainLeftClick(ev: MouseEvent): boolean {
  return ev.button === 0 && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && !ev.altKey;
}

function findAnchor(el: EventTarget | null): HTMLAnchorElement | null {
  try {
    let node = el as Node | null;
    while (node && node instanceof Node) {
      if (node instanceof HTMLAnchorElement) return node;
      node = (node as HTMLElement).parentElement;
    }
  } catch {}
  return null;
}

export function attachClickListener(label: string = '[discourse-new-tab]') {
  const handler = async (ev: MouseEvent) => {
    try {
      if (!isPlainLeftClick(ev)) return; // 尊重 Ctrl/Meta/中键等用户意图

      const a = findAnchor(ev.target);
      if (!a) return;
      if (!a.href) return;
      if (a.hasAttribute('download')) return; // 下载链接不拦截
      if (a.getAttribute('data-dnt-ignore') === '1') return; // 提供逃生口

      const targetUrl = toAbsoluteUrl(a.getAttribute('href') || a.href, location.href);
      if (!targetUrl) return;

      const ctx: LinkContext = { anchor: a, targetUrl, currentUrl: new URL(location.href) };

      const decision = await evaluateRules(getAllRules(), ctx);
      if (decision.action === 'new_tab') {
        // 新标签页打开，阻止原生行为
        ev.preventDefault();
        // 避免 opener 泄漏
        window.open(targetUrl.href, '_blank', 'noopener');
        // 可选：日志
        // console.debug(`${label} 规则命中[${decision.ruleId}] → 新标签`, decision.debug);
      } else if (decision.action === 'same_tab') {
        // 预留：目前未使用，未来可用作“强制同页打开”
        // ev.preventDefault(); location.assign(targetUrl.href);
      } else {
        // keep_native：保持原生，什么都不做
      }
    } catch (err) {
      // 出错时不影响原生行为
      // console.warn('[discourse-new-tab] click handler error:', err);
    }
  };

  document.addEventListener('click', handler, true);
}

