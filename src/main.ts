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
    try { return window.top === window; } catch { return true; }
  })();

  if (!isTop) return;

  const result = detectDiscourse();

  // 结合白/黑名单，计算最终启用状态（白 > 黑 > 自动识别）
  const host = getCurrentHostname();
  const enable = await getEnablement(result.isDiscourse, host);
  // 启用时挂载点击监听（统一由规则引擎决策是否新标签或保留原生）
  if (enable.enabled) {
    attachClickListener(label);
  }

  // 设置入口 - 打开设置界面
  gmRegisterMenu('设置', async () => {
    const { openSettings } = await import('./ui/settings');
    await openSettings();
  });
})();

