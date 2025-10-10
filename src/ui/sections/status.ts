// 状态区域
import { getCurrentHostname, getEnablement } from '../../storage/domainLists';
import { detectDiscourse } from '../../detectors/siteDetector';
import { t } from '../i18n';

const STATUS_CONTENT_ID = 'dnt-status-content';

export function renderStatusSection(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'dnt-section';

  const title = document.createElement('h3');
  title.className = 'dnt-section-title';
  title.textContent = t('settings.status.title');
  section.appendChild(title);

  const content = document.createElement('div');
  content.className = 'dnt-status-content';
  content.id = STATUS_CONTENT_ID;
  section.appendChild(content);

  // 异步加载状态信息
  updateStatusContent(content);

  return section;
}

async function updateStatusContent(content: HTMLElement) {
  const host = getCurrentHostname();
  const result = detectDiscourse();
  const enable = await getEnablement(result.isDiscourse, host);

  // 清空内容
  content.innerHTML = '';

  // 域名行
  const domainRow = document.createElement('div');
  domainRow.className = 'dnt-status-row';
  const domainLabel = document.createElement('span');
  domainLabel.className = 'dnt-status-label';
  domainLabel.textContent = t('settings.status.domain') + ':';
  const domainValue = document.createElement('span');
  domainValue.className = 'dnt-status-value dnt-domain-text';
  domainValue.textContent = host;
  domainRow.appendChild(domainLabel);
  domainRow.appendChild(domainValue);
  content.appendChild(domainRow);

  // 状态行
  const statusRow = document.createElement('div');
  statusRow.className = 'dnt-status-row';
  const statusLabel = document.createElement('span');
  statusLabel.className = 'dnt-status-label';
  statusLabel.textContent = t(enable.enabled ? 'settings.status.enabled' : 'settings.status.disabled');

  const reasonBadge = document.createElement('span');
  reasonBadge.className = `dnt-badge dnt-badge-${enable.reason}`;
  reasonBadge.textContent = t(`settings.status.reason.${enable.reason}`);

  statusRow.appendChild(statusLabel);
  statusRow.appendChild(reasonBadge);
  content.appendChild(statusRow);
}

// 导出刷新函数供其他模块调用
export async function refreshStatusSection() {
  const content = document.getElementById(STATUS_CONTENT_ID);
  if (content) {
    await updateStatusContent(content);
  }
}
