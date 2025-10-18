// 轻量封装 GM_*，在不支持的环境降级到 localStorage
const LABEL = '[discourse-new-tab]';

type AnyFunc = (...args: any[]) => any;

function isPromise<T>(v: any): v is Promise<T> {
  return v && typeof v.then === 'function';
}

export async function gmGet<T>(key: string, def?: T): Promise<T | undefined> {
  try {
    const gmg: AnyFunc | undefined = (globalThis as any).GM_getValue;
    if (typeof gmg === 'function') {
      const r = gmg(key, def as any);
      return isPromise<T>(r) ? await r : (r as T);
    }
    const GM: any = (globalThis as any).GM;
    if (GM?.getValue) {
      return await GM.getValue(key, def);
    }
  } catch (err) { console.warn(LABEL, 'GM_getValue 调用失败，尝试使用 localStorage', err); }
  try {
    const raw = localStorage.getItem(`dnt:${key}`);
    return raw == null ? def : (JSON.parse(raw) as T);
  } catch (err) {
    console.warn(LABEL, 'localStorage 读取失败', err);
    return def;
  }
}

export async function gmSet<T>(key: string, value: T): Promise<void> {
  try {
    const gms: AnyFunc | undefined = (globalThis as any).GM_setValue;
    if (typeof gms === 'function') {
      const r = gms(key, value as any);
      if (isPromise<void>(r)) await r;
      return;
    }
    const GM: any = (globalThis as any).GM;
    if (GM?.setValue) {
      await GM.setValue(key, value);
      return;
    }
  } catch (err) { console.warn(LABEL, 'GM_setValue 调用失败，尝试使用 localStorage', err); }
  try {
    localStorage.setItem(`dnt:${key}`, JSON.stringify(value));
  } catch (err) { console.warn(LABEL, 'localStorage 写入失败', err); }
}

export async function gmDelete(key: string): Promise<void> {
  try {
    const gmd: AnyFunc | undefined = (globalThis as any).GM_deleteValue;
    if (typeof gmd === 'function') {
      const r = gmd(key);
      if (isPromise<void>(r)) await r;
      return;
    }
    const GM: any = (globalThis as any).GM;
    if (GM?.deleteValue) {
      await GM.deleteValue(key);
      return;
    }
  } catch (err) { console.warn(LABEL, 'GM_deleteValue 调用失败，尝试使用 localStorage', err); }
  try {
    localStorage.removeItem(`dnt:${key}`);
  } catch (err) { console.warn(LABEL, 'localStorage 删除失败', err); }
}

export async function gmList(): Promise<string[]> {
  try {
    const gml: AnyFunc | undefined = (globalThis as any).GM_listValues;
    if (typeof gml === 'function') {
      const r = gml();
      return isPromise<string[]>(r) ? await r : (r as string[]);
    }
    const GM: any = (globalThis as any).GM;
    if (GM?.listValues) {
      return await GM.listValues();
    }
  } catch (err) { console.warn(LABEL, 'GM_listValues 调用失败，尝试使用 localStorage', err); }
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith('dnt:'))
      .map((k) => k.slice(4));
  } catch (err) {
    console.warn(LABEL, 'localStorage 枚举失败', err);
    return [];
  }
}

export function gmRegisterMenu(label: string, cb: () => void) {
  try {
    const reg: AnyFunc | undefined = (globalThis as any).GM_registerMenuCommand;
    if (typeof reg === 'function') {
      reg(label, cb);
      return;
    }
  } catch (err) { console.warn(LABEL, 'GM_registerMenuCommand 调用失败，忽略', err); }
  // 无法注册菜单时不抛错（某些管理器不支持），降级为 no-op
}

