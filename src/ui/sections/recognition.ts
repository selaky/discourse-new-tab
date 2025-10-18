// 论坛识别区域 - 包含当前状态和黑白名单
import { renderStatusSection } from './status';
import { renderDomainSection } from './domain';

export function renderRecognitionCategory(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'dnt-category-content';

  // 当前状态
  container.appendChild(renderStatusSection());

  // 黑白名单
  container.appendChild(renderDomainSection());

  return container;
}
