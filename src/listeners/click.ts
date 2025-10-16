// 点击监听与统一跳转处理

import { evaluateRules } from '../decision/engine';
import type { LinkContext } from '../decision/types';
import { getAllRules } from '../rules';
import { toAbsoluteUrl } from '../utils/url';

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
        // 新标签页打开，并强力阻止原页面的任何进一步处理
        ev.preventDefault();
        ev.stopImmediatePropagation();
        ev.stopPropagation();
        window.open(targetUrl.href, '_blank', 'noopener'); // 避免 opener 泄漏
        a.setAttribute('data-dnt-handled', '1');
        return; // 终止后续处理
      } else if (decision.action === 'same_tab') {
        // 预留：目前未使用，未来可用作“强制同页打开”
        // ev.preventDefault(); location.assign(targetUrl.href);
      } else {
        // keep_native：保持原生，什么都不做
      }
    } catch (err) {
      // 出错时不影响原生行为. 这个 catch 块是必要的，以防逻辑中出现意外错误，保证不破坏页面默认行为。
    }
  };

  // 捕获阶段尽早拦截，降低站点脚本先行处理的概率
  document.addEventListener('click', handler, true);
}
