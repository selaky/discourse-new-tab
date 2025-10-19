# UI 文档

## 概述

设置界面采用模态对话框形式,提供简洁直观的配置管理功能。

## 主题系统

### 支持的主题模式

- **日间模式 (light)**: 浅色背景,适合明亮环境
- **夜间模式 (dark)**: 深色背景,减少眼睛疲劳
- **自动模式 (auto)**: 根据系统偏好自动切换

### 主题切换

```typescript
import { setTheme, toggleTheme } from './ui/theme';

// 设置指定主题
await setTheme('dark');

// 循环切换主题
await toggleTheme();
```

### 主题变量

所有颜色通过CSS变量定义,支持日间/夜间自动适配:

```css
--dnt-bg-dialog      /* 对话框背景 */
--dnt-text-primary   /* 主要文字颜色 */
--dnt-primary        /* 主题色 */
```

## 国际化

### 支持的语言

- **中文 (zh)**: 默认语言
- **英文 (en)**: 英语界面

### 语言切换

```typescript
import { setLanguage, toggleLanguage, t } from './ui/i18n';

// 设置指定语言
await setLanguage('en');

// 循环切换语言
await toggleLanguage();

// 获取翻译文本
const title = t('settings.title');
```

### 添加翻译

在 [i18n.ts](../src/ui/i18n.ts) 的 `translations` 对象中添加:

```typescript
const translations: Record<Language, Record<string, any>> = {
  zh: {
    newSection: {
      title: '新区块',
      description: '描述文字',
    },
  },
  en: {
    newSection: {
      title: 'New Section',
      description: 'Description text',
    },
  },
};
```

## 组件

### 对话框结构

```
dnt-overlay (遮罩层)
└── dnt-dialog (对话框)
    ├── dnt-header (头部)
    │   ├── dnt-title (标题)
    │   └── dnt-controls (控制按钮组)
    │       ├── 主题切换按钮
    │       ├── 语言切换按钮
    │       └── 关闭按钮
    └── dnt-content (内容区)
        ├── 状态区块
        ├── 论坛识别区块
        ├── 链接打开方式区块
        └── 跳转规则区块
```

### 常用类名

- `.dnt-section`: 区块容器
- `.dnt-section-title`: 区块标题
- `.dnt-btn`: 通用按钮
- `.dnt-btn-primary`: 主要按钮
- `.dnt-input`: 输入框
- `.dnt-toggle`: 开关控件

## 设置界面入口

### 打开设置

```typescript
import { openSettings } from './ui/settings';

await openSettings();
```

### 关闭设置

```typescript
import { closeSettings } from './ui/settings';

closeSettings();
```

## 样式注入

样式通过 [inject-styles.ts](../src/ui/inject-styles.ts) 动态注入,在首次打开设置时自动加载。

CSS 文件在构建时被打包为字符串,无需额外的网络请求。

## 区块模块

### 状态区块

文件: [sections/status.ts](../src/ui/sections/status.ts)

显示当前域名和脚本启用状态。

### 论坛识别区块

文件: [sections/domain.ts](../src/ui/sections/domain.ts)

管理白名单和黑名单:
- 添加/删除域名
- 一键添加当前域名
- 域名列表展示

### 链接打开方式区块

文件: src/ui/sections/open.ts

配置“后台打开新标签页”的二次判定:
- 选项: 无 / 仅主题帖 / 全部
- 生效范围: 仅当原规则决策为“新标签页”时才触发，按此处设置决定是否后台打开
- 存储键: `open:bg-mode`

#### 悬浮球（后台打开模式切换）

- 入口：同区块内新增四项
  - `显示前后台切换悬浮球`（开关，默认开）
  - `固定悬浮球位置`（开关，默认关）
  - `重置悬浮球位置`（按钮）
  - `可通过悬浮球切换的类型`（复选：无/仅主题帖/全部，至少勾选两项）
- 行为：
  - 悬浮球点击在允许的模式集合中循环：无 → 仅主题帖 → 全部 → …
  - 悬浮球可拖动，保存为视口百分比，窗口尺寸变化时按比例复位并保持可见
  - 主题适配：跟随设置面板日间/夜间/自动
- 存储键：
  - `ui:floatball:enabled`（是否显示）
  - `ui:floatball:fixed`（是否固定）
  - `ui:floatball:pos`（位置：`{ xRatio, yRatio }`）
  - `ui:floatball:allowed-modes`（允许模式：`{ none, topic, all }`）

### 跳转规则区块

文件: [sections/rules.ts](../src/ui/sections/rules.ts)

配置各类跳转规则的开关状态。规则按分组展示:
- 主题帖
- 个人主页
- 附件
- 弹窗
- 侧边栏

## 响应式设计

对话框在不同屏幕尺寸下自适应:

- 桌面端: 最大宽度 680px,占屏幕 90%
- 移动端: 占屏幕 95%,调整内边距

## 数据持久化

所有设置通过 GM_setValue/GM_getValue 存储:

- 主题偏好: `ui-theme`
- 语言偏好: `ui-language`
- 规则开关: `ruleFlags`
- 白名单: `whitelist`
- 黑名单: `blacklist`
