import type { RuleDecision, PageContext } from '../types/rules';
import type { RuleSwitches } from '../types/config';
import { detectPageKind, extractTopicId, isAttachmentPath, isSameHost } from '../utils/url';

function buildContext(url: URL): PageContext {
  const detected = detectPageKind(url);
  return {
    kind: detected.kind,
    topicId: detected.topicId,
    rawUrl: url
  };
}

function isPopupLike(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute('href') || '';
  if (!href || href === '#' || href.startsWith('#') || href.startsWith('javascript:')) {
    return true;
  }
  if (anchor.getAttribute('role') === 'button') {
    return true;
  }
  if (anchor.dataset.autoRoute === 'true') {
    return true;
  }
  if (anchor.dataset.userCard) {
    return true;
  }
  if (anchor.dataset.action) {
    return true;
  }
  const classes = anchor.classList;
  if (classes.contains('trigger-user-card') || classes.contains('user-card-link') || classes.contains('mention') || classes.contains('poster-avatar')) {
    return true;
  }
  if (anchor.closest('.topic-avatar') || anchor.closest('.user-card')) {
    return true;
  }
  return false;
}

function isAttachmentLink(anchor: HTMLAnchorElement, url: URL): boolean {
  if (anchor.hasAttribute('download')) {
    return true;
  }
  if (anchor.dataset.download === 'true') {
    return true;
  }
  if (anchor.classList.contains('lightbox') || anchor.closest('.lightbox-wrapper')) {
    return true;
  }
  return isAttachmentPath(url);
}

function sameTopic(a?: string, b?: string): boolean {
  return Boolean(a && b && a === b);
}

export interface EvaluateParams {
  anchor: HTMLAnchorElement;
  currentUrl: URL;
  targetUrl: URL;
  rules: RuleSwitches;
}

export function evaluateLink(params: EvaluateParams): RuleDecision {
  const { anchor, currentUrl, targetUrl, rules } = params;
  if (!isSameHost(currentUrl, targetUrl)) {
    return { openInNewTab: false, reason: 'different-host' };
  }

  const currentCtx = buildContext(currentUrl);
  const targetCtx = buildContext(targetUrl);

  if (rules.skipPopupLike && isPopupLike(anchor)) {
    return { openInNewTab: false, reason: 'popup-like' };
  }

  if (rules.skipAttachments && isAttachmentLink(anchor, targetUrl)) {
    return { openInNewTab: false, reason: 'attachment' };
  }

  if (rules.keepSameTopicInTab && sameTopic(currentCtx.topicId, targetCtx.topicId)) {
    return { openInNewTab: false, reason: 'same-topic' };
  }

  const targetIsTopic = targetCtx.kind === 'topic' || Boolean(extractTopicId(targetUrl));
  const currentIsTopic = currentCtx.kind === 'topic';

  if (rules.enableTopicNewTab && (targetIsTopic || currentIsTopic)) {
    if (rules.keepNonTopicDefault && !targetIsTopic && !currentIsTopic) {
      return { openInNewTab: false, reason: 'non-topic' };
    }
    return { openInNewTab: true, reason: 'topic-involved' };
  }

  if (rules.keepNonTopicDefault && targetCtx.kind !== 'topic' && currentCtx.kind !== 'topic') {
    return { openInNewTab: false, reason: 'non-topic' };
  }

  return { openInNewTab: false, reason: 'fallback' };
}