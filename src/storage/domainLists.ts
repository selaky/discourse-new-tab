import { gmGet, gmSet } from './gm';

const KEY_WHITE = 'whitelist';
const KEY_BLACK = 'blacklist';

export type Lists = { whitelist: string[]; blacklist: string[] };

function normalizeDomain(input: string): string {
  try {
    // 仅保留主机名部分，去掉空格与端口
    const s = (input || '').trim().toLowerCase();
    // 如果是完整 URL，则用 URL 解析；否则按主机名处理
    if (/^https?:\/\//i.test(s)) {
      return new URL(s).hostname;
    }
    return s.split(':')[0];
  } catch {
    return (input || '').trim().toLowerCase();
  }
}

function uniqSort(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean).map(normalizeDomain))).sort();
}

export async function getLists(): Promise<Lists> {
  const whitelist = (await gmGet<string[]>(KEY_WHITE, [])) || [];
  const blacklist = (await gmGet<string[]>(KEY_BLACK, [])) || [];
  return { whitelist: uniqSort(whitelist), blacklist: uniqSort(blacklist) };
}

export async function addToWhitelist(domain: string): Promise<{ added: boolean; list: string[] }> {
  const { whitelist } = await getLists();
  const d = normalizeDomain(domain);
  if (!whitelist.includes(d)) {
    whitelist.push(d);
    await gmSet(KEY_WHITE, uniqSort(whitelist));
    return { added: true, list: uniqSort(whitelist) };
  }
  return { added: false, list: whitelist };
}

export async function removeFromWhitelist(domain: string): Promise<{ removed: boolean; list: string[] }> {
  const { whitelist } = await getLists();
  const d = normalizeDomain(domain);
  const next = whitelist.filter((x) => x !== d);
  const removed = next.length !== whitelist.length;
  if (removed) await gmSet(KEY_WHITE, uniqSort(next));
  return { removed, list: uniqSort(next) };
}

export async function addToBlacklist(domain: string): Promise<{ added: boolean; list: string[] }> {
  const { blacklist } = await getLists();
  const d = normalizeDomain(domain);
  if (!blacklist.includes(d)) {
    blacklist.push(d);
    await gmSet(KEY_BLACK, uniqSort(blacklist));
    return { added: true, list: uniqSort(blacklist) };
  }
  return { added: false, list: blacklist };
}

export async function removeFromBlacklist(domain: string): Promise<{ removed: boolean; list: string[] }> {
  const { blacklist } = await getLists();
  const d = normalizeDomain(domain);
  const next = blacklist.filter((x) => x !== d);
  const removed = next.length !== blacklist.length;
  if (removed) await gmSet(KEY_BLACK, uniqSort(next));
  return { removed, list: uniqSort(next) };
}

export function getCurrentHostname(): string {
  try {
    return location.hostname.toLowerCase();
  } catch {
    return '';
  }
}

export type EnableReason = 'blacklist' | 'whitelist' | 'auto' | 'disabled';
export type EnableResult = { enabled: boolean; reason: EnableReason };

export async function getEnablement(autoIsDiscourse: boolean, host?: string): Promise<EnableResult> {
  const { whitelist, blacklist } = await getLists();
  const h = normalizeDomain(host || getCurrentHostname());
  if (blacklist.includes(h)) return { enabled: false, reason: 'blacklist' };
  if (whitelist.includes(h)) return { enabled: true, reason: 'whitelist' };
  if (autoIsDiscourse) return { enabled: true, reason: 'auto' };
  return { enabled: false, reason: 'disabled' };
}

