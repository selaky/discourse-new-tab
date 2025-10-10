// 样式注入模块
import styles from './styles.css';

let injected = false;

export function injectStyles() {
  if (injected) return;

  const styleEl = document.createElement('style');
  styleEl.id = 'dnt-settings-styles';
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  injected = true;
}

export function removeStyles() {
  const existing = document.getElementById('dnt-settings-styles');
  if (existing) {
    existing.remove();
    injected = false;
  }
}
