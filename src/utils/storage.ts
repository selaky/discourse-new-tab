const STORAGE_KEY = 'discourseNewTab.config';

type JsonValue = unknown;

type Getter = <T>(key: string, defaultValue: T) => T;
type Setter = <T>(key: string, value: T) => void;
type Remover = (key: string) => void;

function resolveGetter(): Getter {
  if (typeof GM_getValue === 'function') {
    return (key, defaultValue) => GM_getValue(key, defaultValue);
  }
  return (key, defaultValue) => {
    const raw = window.localStorage.getItem(key);
    return raw === null ? defaultValue : JSON.parse(raw);
  };
}

function resolveSetter(): Setter {
  if (typeof GM_setValue === 'function') {
    return (key, value) => GM_setValue(key, value as JsonValue);
  }
  return (key, value) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  };
}

function resolveRemover(): Remover {
  if (typeof GM_deleteValue === 'function') {
    return (key) => GM_deleteValue(key);
  }
  return (key) => window.localStorage.removeItem(key);
}

const getValue = resolveGetter();
const setValue = resolveSetter();
const removeValue = resolveRemover();

export function readConfig<T>(fallback: T): T {
  try {
    return getValue(STORAGE_KEY, fallback);
  } catch (error) {
    console.warn('[discourse-new-tab] readConfig failed, fallback used', error);
    return fallback;
  }
}

export function writeConfig<T>(value: T): void {
  try {
    setValue(STORAGE_KEY, value as JsonValue);
  } catch (error) {
    console.warn('[discourse-new-tab] writeConfig failed', error);
  }
}

export function clearConfig(): void {
  try {
    removeValue(STORAGE_KEY);
  } catch (error) {
    console.warn('[discourse-new-tab] clearConfig failed', error);
  }
}