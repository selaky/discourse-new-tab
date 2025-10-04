export function injectStyles(css: string): void {
  if (typeof GM_addStyle === 'function') {
    GM_addStyle(css);
    return;
  }
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}