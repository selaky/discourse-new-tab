// URL 工具：将 href 规范化并解析 Discourse 常见链接形态（中文注释）

export function toAbsoluteUrl(href: string, base: string): URL | null {
  try {
    // 空或无效直接忽略
    if (!href || typeof href !== 'string') return null;
    return new URL(href, base);
  } catch {
    return null;
  }
}

// 解析 Discourse 主题帖的 ID（尽量覆盖常见变种）
export function extractTopicId(pathname: string): number | undefined {
  try {
    const p = (pathname || '').toLowerCase();
    // 常见形式：/t/slug/12345[/post]、/t/12345[/post]
    const patterns: RegExp[] = [
      /\/t\/[\w%\-\.]+\/(\d+)(?:\/|$)/i, // 带 slug
      /\/t\/(\d+)(?:\/|$)/i, // 仅 id
    ];
    for (const re of patterns) {
      const m = p.match(re);
      if (m && m[1]) {
        const id = parseInt(m[1], 10);
        if (!Number.isNaN(id)) return id;
      }
    }
  } catch {}
  return undefined;
}

// 解析 Discourse 用户主页（用户名）
export function extractUsername(pathname: string): string | undefined {
  try {
    const p = (pathname || '').toLowerCase();
    // /u/<username>/...
    const m = p.match(/\/u\/([\w%\-\.]+)/i);
    if (m && m[1]) return decodeURIComponent(m[1]);
  } catch {}
  return undefined;
}

// 判断是否是常见附件（图片、文件等）链接（保守处理，可扩展）
export function isLikelyAttachment(pathname: string): boolean {
  const p = (pathname || '').toLowerCase();
  // 典型附件路径包含 /uploads/ 或文件扩展名
  if (p.includes('/uploads/')) return true;
  if (/\.(png|jpe?g|gif|webp|svg|zip|rar|7z|pdf|mp4|mp3)$/i.test(p)) return true;
  return false;
}

