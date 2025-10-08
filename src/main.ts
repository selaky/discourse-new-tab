import { detectDiscourse } from './detectors/siteDetector';

(() => {
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
})();
