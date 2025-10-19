// 悬浮球相关设置的持久化（中文注释）
// 负责：是否显示、是否固定、位置（相对视口百分比）、可切换的模式集合

import { gmGet, gmSet } from './gm';
import type { BackgroundOpenMode } from './openMode';

export type FloatBallPos = { xRatio: number; yRatio: number };

const KEY_FB_ENABLED = 'ui:floatball:enabled';
const KEY_FB_FIXED = 'ui:floatball:fixed';
const KEY_FB_POS = 'ui:floatball:pos';
const KEY_FB_ALLOWED = 'ui:floatball:allowed-modes';

// 默认：右侧中上（更贴边一些以不遮挡主要内容）
const DEFAULT_POS: FloatBallPos = { xRatio: 0.94, yRatio: 0.66 };

export type AllowedModes = Record<BackgroundOpenMode, boolean>;

const DEFAULT_ALLOWED: AllowedModes = { none: true, topic: true, all: true };

export async function getFloatBallEnabled(): Promise<boolean> {
  const v = await gmGet<boolean>(KEY_FB_ENABLED, true);
  return !!v;
}

export async function setFloatBallEnabled(enabled: boolean): Promise<void> {
  await gmSet(KEY_FB_ENABLED, !!enabled);
}

export async function getFloatBallFixed(): Promise<boolean> {
  const v = await gmGet<boolean>(KEY_FB_FIXED, false);
  return !!v;
}

export async function setFloatBallFixed(fixed: boolean): Promise<void> {
  await gmSet(KEY_FB_FIXED, !!fixed);
}

export async function getFloatBallPos(): Promise<FloatBallPos> {
  const pos = await gmGet<FloatBallPos>(KEY_FB_POS, DEFAULT_POS);
  // 基本容错（防止历史脏值）：比值需在 0~1 之间
  const xr = Math.min(0.98, Math.max(0.02, pos?.xRatio ?? DEFAULT_POS.xRatio));
  const yr = Math.min(0.98, Math.max(0.02, pos?.yRatio ?? DEFAULT_POS.yRatio));
  return { xRatio: xr, yRatio: yr };
}

export async function setFloatBallPos(pos: FloatBallPos): Promise<void> {
  const xr = Math.min(0.98, Math.max(0.02, pos.xRatio));
  const yr = Math.min(0.98, Math.max(0.02, pos.yRatio));
  await gmSet(KEY_FB_POS, { xRatio: xr, yRatio: yr });
}

export async function resetFloatBallPos(): Promise<FloatBallPos> {
  await gmSet(KEY_FB_POS, DEFAULT_POS);
  return DEFAULT_POS;
}

export async function getAllowedModes(): Promise<AllowedModes> {
  const saved = (await gmGet<AllowedModes>(KEY_FB_ALLOWED, DEFAULT_ALLOWED)) || DEFAULT_ALLOWED;
  return normalizeAllowed(saved);
}

export async function setAllowedModes(m: AllowedModes): Promise<AllowedModes> {
  const nm = normalizeAllowed(m);
  await gmSet(KEY_FB_ALLOWED, nm);
  return nm;
}

// 归一化：确保至少勾选 2 项。若不足两项，自动补回 'topic' 和 'all'.
function normalizeAllowed(m: AllowedModes): AllowedModes {
  const nm: AllowedModes = {
    none: !!m?.none,
    topic: !!m?.topic,
    all: !!m?.all,
  };
  const count = (nm.none ? 1 : 0) + (nm.topic ? 1 : 0) + (nm.all ? 1 : 0);
  if (count >= 2) return nm;
  // 自动补足：优先补 'topic'，再补 'all'
  if (!nm.topic) nm.topic = true;
  if (!nm.all && (nm.none ? 1 : 0) + (nm.topic ? 1 : 0) < 2) nm.all = true;
  return nm;
}

export const __keys = {
  KEY_FB_ENABLED,
  KEY_FB_FIXED,
  KEY_FB_POS,
  KEY_FB_ALLOWED,
};

