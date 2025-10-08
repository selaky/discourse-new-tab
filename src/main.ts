import { detectDiscourse } from './detectors/siteDetector';
import { gmRegisterMenu } from './storage/gm';
import {
  addToBlacklist,
  addToWhitelist,
  getCurrentHostname,
  getEnablement,
  removeFromBlacklist,
  removeFromWhitelist,
} from './storage/domainLists';

const DEV_MENUS = true; // 发布前可改为 false，仅保留“设置入口（占位）”

(async () => {
  const label = '[discourse-new-tab]';
  const isTop = (() => {
    try { return window.top === window; } catch { return true; }
  })();

  if (!isTop) return; // 顶层窗口才打印，避免噪声

  // 心跳日志：证明脚本已加载（MVP+识别结果）
  console.log(`${label} 脚本已加载（MVP）。`);

  // 论坛识别（仅打印识别结果与命中要点，不改动页面行为）
  const result = detectDiscourse();
  if (result.isDiscourse) {
    console.log(`${label} 识别为 Discourse 站点（score=${result.score}/${result.threshold}）。`);
  } else {
    console.log(`${label} 非 Discourse 站点（score=${result.score}/${result.threshold}）。`);
  }
  if (result.matchedSignals.length) {
    console.log(
      `${label} 命中信号：`,
      result.matchedSignals.map(s => `${s.name}(+${s.weight})`).join(' | ')
    );
  }

  // 结合白/黑名单，计算最终启用状态（黑 > 白 > 自动识别）
  const host = getCurrentHostname();
  const enable = await getEnablement(result.isDiscourse, host);
  console.log(`${label} 当前域名：${host} | 状态：${enable.enabled ? '已启用' : '未启用'}（原因：${enable.reason}）`);

  // 设置入口（占位）—— 统一 GUI 未来接管
  gmRegisterMenu('设置入口（占位）', () => {
    console.log(`${label} 设置界面尚未实现，后续版本将提供图形界面。`);
  });

  // 调试菜单：仅在开发阶段开启，方便验证白/黑名单
  if (DEV_MENUS) {
    gmRegisterMenu('【调试】查看当前域状态', async () => {
      const r = await getEnablement(result.isDiscourse, host);
      console.log(`${label} 域：${host} | 状态：${r.enabled ? '已启用' : '未启用'}（原因：${r.reason}）`);
    });
    gmRegisterMenu('【调试】白名单：添加当前域', async () => {
      const { added } = await addToWhitelist(host);
      console.log(`${label} 白名单${added ? '已添加' : '已存在'}：${host}`);
    });
    gmRegisterMenu('【调试】白名单：移除当前域', async () => {
      const { removed } = await removeFromWhitelist(host);
      console.log(`${label} 白名单${removed ? '已移除' : '不存在'}：${host}`);
    });
    gmRegisterMenu('【调试】黑名单：添加当前域', async () => {
      const { added } = await addToBlacklist(host);
      console.log(`${label} 黑名单${added ? '已添加' : '已存在'}：${host}`);
    });
    gmRegisterMenu('【调试】黑名单：移除当前域', async () => {
      const { removed } = await removeFromBlacklist(host);
      console.log(`${label} 黑名单${removed ? '已移除' : '不存在'}：${host}`);
    });
  }
})();
