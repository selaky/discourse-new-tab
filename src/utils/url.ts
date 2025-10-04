const TOPIC_REGEX = /\/t\/(?:[^/]+\/)?(\d+)/;

export function toAbsoluteUrl(input: string, base?: URL): URL | null {
  if (!input) return null;
  try {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return new URL(input);
    }
    const origin = base ?? new URL(window.location.href);
    return new URL(input, origin);
  } catch (error) {
    console.warn('[discourse-new-tab] failed to resolve URL', input, error);
    return null;
  }
}

export function extractTopicId(url: URL): string | null {
  const match = TOPIC_REGEX.exec(url.pathname);
  return match ? match[1] : null;
}

export function isSameHost(a: URL, b: URL): boolean {
  return a.host === b.host;
}

export function isAttachmentPath(url: URL): boolean {
  if (url.pathname.includes('/uploads/')) {
    return true;
  }
  const extMatch = url.pathname.match(/\.([a-z0-9]{2,4})$/i);
  if (!extMatch) return false;
  const extension = extMatch[1].toLowerCase();
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'zip', 'rar', '7z', 'pdf', 'mp4', 'mp3', 'webm', 'ogg', 'wav', 'flac'].includes(extension);
}

export function detectPageKind(url: URL): { kind: 'topic' | 'category' | 'user' | 'homepage' | 'search' | 'external' | 'unknown'; topicId?: string } {
  if (url.origin !== window.location.origin) {
    return { kind: 'external' };
  }
  const topicId = extractTopicId(url);
  if (topicId) {
    return { kind: 'topic', topicId };
  }
  const path = url.pathname;
  if (path === '/' || path === '') {
    return { kind: 'homepage' };
  }
  if (path.startsWith('/c/')) {
    return { kind: 'category' };
  }
  if (path.startsWith('/u/')) {
    return { kind: 'user' };
  }
  if (path.startsWith('/search')) {
    return { kind: 'search' };
  }
  return { kind: 'unknown' };
}