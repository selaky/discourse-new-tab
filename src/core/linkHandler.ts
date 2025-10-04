import { configManager } from './config';
import { evaluateLink } from './ruleEngine';
import { toAbsoluteUrl } from '../utils/url';

function shouldIgnoreEvent(event: MouseEvent, anchor: HTMLAnchorElement): boolean {
  if (event.defaultPrevented) return true;
  if (event.button !== 0) return true;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
  if (anchor.target && anchor.target !== '_self') return true;
  if (anchor.hasAttribute('download')) return true;
  const href = anchor.getAttribute('href');
  if (!href) return true;
  if (href.startsWith('javascript:')) return true;
  return false;
}

export function setupLinkHandler(): () => void {
  const listener = (event: MouseEvent) => {
    const target = event.target as Element | null;
    if (!target) return;
    const anchor = target.closest('a');
    if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;

    if (shouldIgnoreEvent(event, anchor)) {
      return;
    }

    const absolute = toAbsoluteUrl(anchor.getAttribute('href') || anchor.href);
    if (!absolute) {
      return;
    }

    const currentUrl = new URL(window.location.href);
    if (absolute.origin !== currentUrl.origin) {
      return;
    }

    const { domainRules } = configManager.getSnapshot(currentUrl.hostname);
    const decision = evaluateLink({
      anchor,
      currentUrl,
      targetUrl: absolute,
      rules: domainRules
    });

    if (decision.openInNewTab) {
      event.preventDefault();
      window.open(absolute.href, '_blank', 'noopener');
    }
  };

  document.addEventListener('click', listener, true);

  return () => {
    document.removeEventListener('click', listener, true);
  };
}