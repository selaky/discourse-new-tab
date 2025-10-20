// 设置分类定义
export type CategoryId = 'recognition' | 'rules' | 'open' | 'debug';

export interface Category {
  id: CategoryId;
  icon: string;
  labelKey: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'recognition',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2L2 7L12 12L22 7L12 2Z"></path>
      <path d="M2 17L12 22L22 17"></path>
      <path d="M2 12L12 17L22 12"></path>
    </svg>`,
    labelKey: 'settings.categories.recognition',
  },
  {
    id: 'rules',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="9 11 12 14 22 4"></polyline>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>`,
    labelKey: 'settings.categories.rules',
  },
  {
    id: 'open',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <rect x="6" y="6" width="12" height="12" rx="1" ry="1" opacity="0.5"></rect>
      <path d="M9 9h6M9 12h4" opacity="0.3"></path>
    </svg>`,
    labelKey: 'settings.categories.open',
  },
  {
    id: 'debug',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>`,
    labelKey: 'settings.categories.debug',
  },
];
