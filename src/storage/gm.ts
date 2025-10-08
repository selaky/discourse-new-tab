// 轻量封装 GM_*，在不支持的环境降级到 localStorage

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
  } catch {}
  try {
    const raw = localStorage.getItem(`dnt:${key}`);
    return raw == null ? def : (JSON.parse(raw) as T);
  } catch {
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
  } catch {}
  try {
    localStorage.setItem(`dnt:${key}`, JSON.stringify(value));
  } catch {}
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
  } catch {}
  try {
    localStorage.removeItem(`dnt:${key}`);
  } catch {}
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
  } catch {}
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith('dnt:'))
      .map((k) => k.slice(4));
  } catch {
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
  } catch {}
  // 无法注册菜单时不抛错（某些管理器不支持），降级为 no-op
}

