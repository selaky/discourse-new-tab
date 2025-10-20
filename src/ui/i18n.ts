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
      categories: {
        recognition: '论坛识别',
        rules: '跳转规则',
        open: '后台打开',
        debug: '调试',
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
        title: '黑白名单',
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
          // 新增：搜索框结果与“更多”按钮
          searchMenu: '搜索框链接用新标签页打开',
        },
        sidebar: {
          title: '侧边栏',
          nonTopicKeepNative: '非主题帖内侧边栏用原生方式',
          inTopicNewTab: '主题帖内侧边栏用新标签页打开',
        },
      },
      openMode: {
        title: '打开方式',
        description: '后台打开是指在新标签页打开链接时,保持当前页面为活动标签,新标签在后台打开',
        selectLabel: '当前模式',
        options: {
          none: '前台打开',
          topic: '主题帖后台',
          all: '全部后台',
        },
        optionDesc: {
          none: '新标签立即激活',
          topic: '打开主题帖时在后台',
          all: '所有新标签都在后台',
        },
        floatball: {
          title: '悬浮球设置',
          tip: '若需要经常切换前后台打开方式,可开启悬浮球,随时点击切换',
          displayTitle: '显示设置',
          switchTitle: '切换设置',
          show: '显示悬浮球',
          showDesc: '在页面上显示快速切换按钮',
          reset: '重置位置',
          fixed: '固定位置',
          fixedDesc: '禁用拖动,锁定悬浮球位置',
          modes: '悬浮球可切换的模式',
          modesDesc: '至少保留2个选项以便切换',
        },
      },
      debug: {
        title: '调试',
        enable: '调试模式',
        allOn: '全部开启',
        allOff: '全部关闭',
        categories: {
          site: '站点识别',
          click: '点击过滤原因',
          link: '链接信息',
          rules: '规则细节',
          final: '最终规则与动作',
          bg: '后台打开',
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
      categories: {
        recognition: 'Forum Recognition',
        rules: 'Navigation Rules',
        open: 'Background Open',
        debug: 'Debug',
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
        title: 'Blacklist & Whitelist',
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
          // New: search popup results and "more" button
          searchMenu: 'Open search box links in new tab',
        },
        sidebar: {
          title: 'Sidebar',
          nonTopicKeepNative: 'Keep native behavior in non-topic pages',
          inTopicNewTab: 'Open sidebar links in new tab within topics',
        },
      },
      openMode: {
        title: 'Open Behavior',
        description: 'Background open means opening links in a new tab while keeping the current page active, with the new tab opened in the background',
        selectLabel: 'Current Mode',
        options: {
          none: 'Foreground',
          topic: 'Topics Background',
          all: 'All Background',
        },
        optionDesc: {
          none: 'New tab activates immediately',
          topic: 'Topics open in background',
          all: 'All new tabs in background',
        },
        floatball: {
          title: 'Float Ball Settings',
          tip: 'If you need to frequently switch between foreground/background modes, enable the float ball to toggle anytime',
          displayTitle: 'Display Settings',
          switchTitle: 'Switch Settings',
          show: 'Show Float Ball',
          showDesc: 'Display quick toggle button on page',
          reset: 'Reset Position',
          fixed: 'Pin Position',
          fixedDesc: 'Lock float ball position',
          modes: 'Switchable Modes',
          modesDesc: 'Keep at least 2 options for switching',
        },
      },
      debug: {
        title: 'Debug',
        enable: 'Debug Mode',
        allOn: 'Enable All',
        allOff: 'Disable All',
        categories: {
          site: 'Site Detection',
          click: 'Click Filter Reasons',
          link: 'Link Info',
          rules: 'Rule Details',
          final: 'Final Rule & Action',
          bg: 'Background Open',
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
