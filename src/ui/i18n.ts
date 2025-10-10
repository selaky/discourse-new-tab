// 国际化：中文/英文
import { gmGet, gmSet } from '../storage/gm';

export type Language = 'zh' | 'en';

const KEY_LANG = 'ui-language';
const LANGUAGES: Language[] = ['zh', 'en'];

// SVG 图标 - 圆角矩形边框 + 文字
export const LanguageIcon: Record<Language, string> = {
  zh: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="6" width="18" height="12" rx="2" ry="2"></rect>
    <text x="12" y="16" text-anchor="middle" font-size="11" font-weight="bold" fill="currentColor" stroke="none">中</text>
  </svg>`,
  en: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="6" width="18" height="12" rx="2" ry="2"></rect>
    <text x="12" y="16" text-anchor="middle" font-size="9" font-weight="bold" fill="currentColor" stroke="none">EN</text>
  </svg>`,
};

let currentLang: Language = 'zh';

// 翻译字典
const translations: Record<Language, Record<string, any>> = {
  zh: {
    settings: {
      title: '设置',
      close: '关闭',
      theme: {
        light: '日间模式',
        dark: '夜间模式',
        auto: '自动模式',
      },
      language: {
        zh: '中文',
        en: 'English',
      },
      status: {
        title: '当前状态',
        domain: '当前域名',
        enabled: '已启用',
        disabled: '未启用',
        reason: {
          auto: '自动识别',
          whitelist: '白名单',
          blacklist: '黑名单',
          disabled: '未识别为 Discourse',
        },
      },
      domain: {
        title: '论坛识别',
        whitelist: '白名单 - 强制启用脚本',
        blacklist: '黑名单 - 强制禁用脚本',
        placeholder: '输入域名',
        add: '添加',
        addCurrent: '添加当前域名',
        edit: '编辑',
        delete: '删除',
        empty: '暂无域名',
      },
      rules: {
        title: '跳转规则',
        topic: {
          title: '主题帖',
          openNewTab: '从任意页面打开主题帖时，用新标签页打开',
          inTopicOpenOther: '在主题帖内部点击其他链接时,用新标签页打开',
          sameTopicKeepNative: '楼层跳转时保留原生跳转方式',
        },
        user: {
          title: '个人主页',
          openNewTab: '从任意页面打开用户个人主页时,用新标签页打开',
          inProfileOpenOther: '在用户个人主页内点击其他链接时,用新标签页打开',
          sameProfileKeepNative: '同一用户主页内跳转时保留原生方式',
        },
        attachment: {
          title: '附件',
          keepNative: '打开图片等附件时,保留原生跳转方式',
        },
        popup: {
          title: '弹窗',
          userCard: '用户卡片内链接用新标签页打开',
          userMenu: '用户菜单内链接用新标签页打开',
        },
        sidebar: {
          title: '侧边栏',
          nonTopicKeepNative: '非主题帖内侧边栏用原生方式',
          inTopicNewTab: '主题帖内侧边栏用新标签页打开',
        },
      },
    },
  },
  en: {
    settings: {
      title: 'Settings',
      close: 'Close',
      theme: {
        light: 'Light Mode',
        dark: 'Dark Mode',
        auto: 'Auto Mode',
      },
      language: {
        zh: '中文',
        en: 'English',
      },
      status: {
        title: 'Current Status',
        domain: 'Current Domain',
        enabled: 'Enabled',
        disabled: 'Disabled',
        reason: {
          auto: 'Auto-detected',
          whitelist: 'Whitelist',
          blacklist: 'Blacklist',
          disabled: 'Not a Discourse forum',
        },
      },
      domain: {
        title: 'Forum Recognition',
        whitelist: 'Whitelist - Force Enable Script',
        blacklist: 'Blacklist - Force Disable Script',
        placeholder: 'Enter domain',
        add: 'Add',
        addCurrent: 'Add Current Domain',
        edit: 'Edit',
        delete: 'Delete',
        empty: 'No domains',
      },
      rules: {
        title: 'Navigation Rules',
        topic: {
          title: 'Topics',
          openNewTab: 'Open topics in new tab from any page',
          inTopicOpenOther: 'Open other links in new tab within topics',
          sameTopicKeepNative: 'Keep native behavior for floor jumps',
        },
        user: {
          title: 'User Profiles',
          openNewTab: 'Open user profiles in new tab from any page',
          inProfileOpenOther: 'Open other links in new tab within profiles',
          sameProfileKeepNative: 'Keep native behavior within same profile',
        },
        attachment: {
          title: 'Attachments',
          keepNative: 'Keep native behavior for images and attachments',
        },
        popup: {
          title: 'Popups',
          userCard: 'Open user card links in new tab',
          userMenu: 'Open user menu links in new tab',
        },
        sidebar: {
          title: 'Sidebar',
          nonTopicKeepNative: 'Keep native behavior in non-topic pages',
          inTopicNewTab: 'Open sidebar links in new tab within topics',
        },
      },
    },
  },
};

export async function initI18n() {
  currentLang = (await gmGet<Language>(KEY_LANG)) || 'zh';
}

export function getLanguage(): Language {
  return currentLang;
}

export async function setLanguage(lang: Language) {
  currentLang = lang;
  await gmSet(KEY_LANG, lang);
}

export async function toggleLanguage() {
  const idx = LANGUAGES.indexOf(currentLang);
  const next = LANGUAGES[(idx + 1) % LANGUAGES.length];
  await setLanguage(next);
}

export function t(key: string): string {
  const keys = key.split('.');
  let obj: any = translations[currentLang];

  for (const k of keys) {
    if (obj && typeof obj === 'object') {
      obj = obj[k];
    } else {
      return key;
    }
  }

  return typeof obj === 'string' ? obj : key;
}
