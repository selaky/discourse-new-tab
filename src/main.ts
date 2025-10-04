import { evaluateActivation } from './core/forumDetector';
import { configManager } from './core/config';
import { setupLinkHandler } from './core/linkHandler';
import { initSettingsPanel } from './ui/settingsPanel';

function runWhenReady(callback: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}

function bootstrap(): void {
  const hostname = window.location.hostname;
  const activation = evaluateActivation(hostname);
  if (!activation.active) {
    console.debug('[discourse-new-tab] inactive:', activation.reason);
    return;
  }

  setupLinkHandler();
  initSettingsPanel({ configManager, activation, host: hostname });
}

runWhenReady(bootstrap);