import { evaluateActivation } from './core/forumDetector';
import { configManager } from './core/config';
import { setupLinkHandler } from './core/linkHandler';
import { initSettingsPanel, openSettings } from './ui/settingsPanel';

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

  // 注册油猴菜单命令
  if (typeof GM_registerMenuCommand !== 'undefined') {
    GM_registerMenuCommand('打开设置面板', openSettings);
  }
}

runWhenReady(bootstrap);