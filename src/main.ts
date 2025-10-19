import { detectDiscourse } from './detectors/siteDetector';
import { gmRegisterMenu } from './storage/gm';
import {
  getCurrentHostname,
  getEnablement,
} from './storage/domainLists';
import { attachClickListener } from './listeners/click';



(async () => {
  const label = '[discourse-new-tab]';
  const isTop = (() => {
    try { return window.top === window; } catch (err) { void logError('site', 'window.top 访问异常，按顶层处理', err); return true; }
  })();

  if (!isTop) return;

  const result = detectDiscourse();
  await logSiteDetection(result);

  // 结合白/黑名单，计算最终启用状态（白 > 黑 > 自动识别）
  const host = getCurrentHostname();
  const enable = await getEnablement(result.isDiscourse, host);
  // 启用时挂载点击监听（统一由规则引擎决策是否新标签或保留原生）
  if (enable.enabled) {
    attachClickListener(label);
    // 悬浮球：初始化（按设置决定是否显示）
    try {
      const { initFloatBall } = await import('./floatball');
      await initFloatBall();
    } catch (err) {
      void logError('bg', '悬浮球初始化失败', err);
    }
  }

  // 设置入口 - 打开设置界面
  gmRegisterMenu('设置', async () => {
    const { openSettings } = await import('./ui/settings');
    await openSettings();
  });
})();

import { logSiteDetection, logError } from './debug/logger';
