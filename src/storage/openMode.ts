// 后台打开新标签页的模式设置

import { gmGet, gmSet } from './gm';

export type BackgroundOpenMode = 'none' | 'topic' | 'all';

const KEY_BG_MODE = 'open:bg-mode';
const DEFAULT_BG_MODE: BackgroundOpenMode = 'none';

export async function getBackgroundOpenMode(): Promise<BackgroundOpenMode> {
  const v = await gmGet<string>(KEY_BG_MODE, DEFAULT_BG_MODE);
  if (v === 'topic' || v === 'all' || v === 'none') return v;
  return DEFAULT_BG_MODE;
}

export async function setBackgroundOpenMode(mode: BackgroundOpenMode): Promise<void> {
  await gmSet(KEY_BG_MODE, mode);
}

