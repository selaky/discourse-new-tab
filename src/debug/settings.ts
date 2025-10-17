// 调试设置：主开关与分类开关的持久化（中文注释）

import { gmGet, gmSet } from '../storage/gm';

export type DebugCategory = 'site' | 'click' | 'link' | 'rules' | 'final';

export const DEBUG_LABEL = '[discourse-new-tab]';

const KEY_DEBUG_ENABLED = 'debug:enabled';
const KEY_DEBUG_CATEGORIES = 'debug:categories';

// 细分类别默认全部开启（仅当主开关开启时才生效）
export const DEFAULT_DEBUG_CATEGORIES: Record<DebugCategory, boolean> = {
  site: true,
  click: true,
  link: true,
  rules: true,
  final: true,
};

export async function getDebugEnabled(): Promise<boolean> {
  const v = await gmGet<boolean>(KEY_DEBUG_ENABLED, false);
  return !!v;
}

export async function setDebugEnabled(enabled: boolean): Promise<void> {
  await gmSet(KEY_DEBUG_ENABLED, !!enabled);
}

export async function getDebugCategories(): Promise<Record<DebugCategory, boolean>> {
  const saved = (await gmGet<Record<string, boolean>>(KEY_DEBUG_CATEGORIES, {})) || {};
  return { ...DEFAULT_DEBUG_CATEGORIES, ...(saved as any) } as Record<DebugCategory, boolean>;
}

export async function setDebugCategory(cat: DebugCategory, enabled: boolean): Promise<void> {
  const cats = await getDebugCategories();
  cats[cat] = !!enabled;
  await gmSet(KEY_DEBUG_CATEGORIES, cats);
}

export async function setAllDebugCategories(enabled: boolean): Promise<void> {
  const all: Record<DebugCategory, boolean> = {
    site: enabled,
    click: enabled,
    link: enabled,
    rules: enabled,
    final: enabled,
  };
  await gmSet(KEY_DEBUG_CATEGORIES, all);
}

