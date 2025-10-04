import { configManager } from './config';

export type ActivationReason = 'whitelist' | 'auto-detected' | 'blacklist' | 'not-discourse';

export interface ActivationResult {
  active: boolean;
  reason: ActivationReason;
}

function hasDiscourseMeta(): boolean {
  const generator = document.querySelector('meta[name="generator"]');
  if (generator && generator.getAttribute('content')?.includes('Discourse')) {
    return true;
  }
  const appName = document.querySelector('meta[name="application-name"]');
  if (appName && appName.getAttribute('content')?.includes('Discourse')) {
    return true;
  }
  return false;
}

function hasDiscourseSignature(): boolean {
  if (typeof unsafeWindow !== 'undefined' && (unsafeWindow as Record<string, unknown>).Discourse) {
    return true;
  }
  if ((window as Record<string, unknown>).Discourse) {
    return true;
  }
  const body = document.body;
  if (body && body.classList.contains('discourse')) {
    return true;
  }
  return false;
}

function autoDetectDiscourse(): boolean {
  return hasDiscourseMeta() || hasDiscourseSignature();
}

export function evaluateActivation(hostname: string): ActivationResult {
  if (configManager.isBlacklisted(hostname)) {
    return { active: false, reason: 'blacklist' };
  }
  if (configManager.isWhitelisted(hostname)) {
    return { active: true, reason: 'whitelist' };
  }
  if (autoDetectDiscourse()) {
    return { active: true, reason: 'auto-detected' };
  }
  return { active: false, reason: 'not-discourse' };
}