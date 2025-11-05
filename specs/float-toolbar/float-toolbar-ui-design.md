# 悬浮工具栏UI设计规范

## 一、悬浮工具栏本体

### 1.1 容器规格

**尺寸与布局**
- 竖排布局，从上到下依次为：拖拽手柄 → 功能按钮列表
- 容器宽度：72px（桌面），68px（移动端 < 768px）
- 定位锚点：底部（按钮数量变化时向上生长）
- 圆角：12px
- 内边距：12px
- 按钮间距：8px（竖向间隔）
- 最大高度：视口高度的 80%（超出时内部滚动）
- 边界安全：距视口边缘至少 8px

**背景与视觉效果**
- 浅色主题：
  - 背景：`rgba(255, 255, 255, 0.9)`
  - 毛玻璃：`backdrop-filter: blur(12px)`
  - 阴影：`0 4px 20px rgba(0, 0, 0, 0.2)`
- 深色主题：
  - 背景：`rgba(30, 30, 30, 0.9)`
  - 毛玻璃：`backdrop-filter: blur(12px)`
  - 阴影：`0 4px 20px rgba(0, 0, 0, 0.5)`

**默认位置**
- 定位方式：fixed
- 默认位置：距视口右边 24px，距视口底部 80px
- 位置存储：使用视口百分比（xRatio, yRatio）

**显示/隐藏动画**
- 动画名称：fade-slide-in
- 时长：0.3s
- 缓动函数：`cubic-bezier(0.4, 0, 0.2, 1)`
- 入场：从 `opacity: 0, translateY(20px)` 到 `opacity: 1, translateY(0)`
- 出场：反向

**响应式调整（移动端）**
- 屏幕宽度 < 768px 时：
  - 默认位置：距右边 16px，距底部 60px
  - 容器内边距：10px
  - 按钮间距：6px

**内部滚动条**（高度超出时）
- 宽度：4px
- 颜色：var(--dnt-text-muted)，透明度 0.3
- 仅悬停时显示

**隐藏规则**
- 所有功能关闭时，工具栏完全隐藏

---

### 1.2 拖拽手柄

**形状与尺寸**
- 形状：圆角矩形横条
- 尺寸：32px（宽） × 4px（高）
- 圆角：2px
- 位置：容器顶部，水平居中，上下边距各 8px

**颜色**
- 默认：CSS变量 `var(--dnt-text-muted)`，透明度 0.5
- 悬停：透明度 0.7
- 拖拽中：透明度 1.0

**交互**
- 光标：悬停时 `cursor: grab`，拖拽时 `cursor: grabbing`
- 可拖拽阈值：移动超过 5px 后开始拖拽
- 拖拽时整个工具栏跟随移动
- 移动端触摸热区：最小 44×20px

---

### 1.3 功能按钮

**按钮规格**
- 形状：圆形
- 尺寸：48px × 48px（桌面端），44px × 44px（移动端 < 768px）
- 图标尺寸：24px × 24px，居中显示

**颜色状态**
- 默认：
  - 背景：`transparent`
  - 图标：`var(--dnt-text-secondary)`
- 悬停：
  - 背景：`var(--dnt-bg-hover)`
  - 图标：`var(--dnt-text-primary)`
  - 缩放：`transform: scale(1.08)`
- 激活/点击：
  - 背景：`var(--dnt-primary)`
  - 图标：`#ffffff`
  - 缩放：`transform: scale(0.95)`
- 当前模式高亮（仅模式切换按钮）：
  - 浅色主题：背景 `var(--dnt-primary)` 透明度 0.1，边框 `2px solid var(--dnt-primary)`
  - 深色主题：背景 `var(--dnt-primary)` 透明度 0.15，边框 `2px solid var(--dnt-primary)`

**过渡动画**
- 属性：`all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`

**Tooltip 提示**
- 位置：按钮左侧，向左偏移 8px
- 背景：`var(--dnt-bg-dialog)`
- 文字颜色：`var(--dnt-text-primary)`
- 边框：`1px solid var(--dnt-border)`
- 圆角：6px
- 内边距：6px 12px
- 字号：13px
- 阴影：`0 2px 8px rgba(0, 0, 0, 0.15)`
- 箭头：6×6px 三角形，尖端指向按钮，颜色同边框
- 触发：悬停 500ms 后显示
- 动画：淡入，时长 0.15s
- 智能定位：工具栏距视口左边缘 < 150px 时，改为显示在右侧（箭头翻转）

---

### 1.4 图标定义

所有图标使用 **Heroicons v2.1.5**（Outline 24×24 风格），通过集中管理系统加载。

**回到顶部**
- 图标：`arrow-up`（Heroicons）
- Tooltip：回到顶部

**模式切换（动态图标）**
- 根据当前模式显示不同图标：
  - **none（不后台打开）**：空心圆
    - 使用自定义SVG：`<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none"/>`
    - Tooltip：不后台打开
  - **topic（仅主题帖）**：三横线列表
    - 图标：`bars-3`（Heroicons）
    - Tooltip：仅主题帖
  - **all（全部后台打开）**：2×2网格
    - 图标：`squares-2x2`（Heroicons）
    - Tooltip：全部后台打开

**打开设置**
- 图标：`cog-6-tooth`（Heroicons）
- Tooltip：打开设置

---

### 1.5 层级定义

- 工具栏容器：z-index: 9999
- Tooltip：z-index: 10000
- 拖拽状态：z-index: 10001

---

## 二、设置界面

### 2.1 分类调整

#### 新增分类："悬浮工具栏"
- 分类ID：`toolbar`
- 分类图标：使用 `squares-plus`（Heroicons）
- 分类名称：悬浮工具栏

#### 调整分类："跳转规则"
- 分类ID：`rules`（保持不变）
- 增加两个并列板块：
  1. **后台打开模式**（新增）
  2. **跳转规则**（原有，从大分类降级为板块）

#### 移除分类："后台打开"
- 内容拆分迁移至其他分类

---

### 2.2 悬浮工具栏设置界面

**整体布局**
- 使用 `.dnt-category-content` 容器
- 板块间距：24px（通过 `gap: 24px`）

---

#### 板块1：基础设置

**板块容器**
- 类名：`.dnt-list-block`
- 背景：`var(--dnt-bg-section)`
- 圆角：6px
- 内边距：16px

**板块标题**
- 类名：`.dnt-list-subtitle`
- 文字：基础设置
- 字号：14px
- 字重：600
- 颜色：`var(--dnt-text-primary)`
- 底部间距：12px

**开关行1：显示悬浮工具栏**
- 类名：`.dnt-toggle-row`
- 标签：显示悬浮工具栏
- 说明：关闭后工具栏将完全隐藏
- 默认状态：开启

**按钮行：重置位置**
- 按钮类名：`.dnt-btn .dnt-btn-secondary`
- 按钮文字：重置位置
- 提示文字（按钮下方）：恢复到默认位置（右下角）
- 提示字号：12px
- 提示颜色：`var(--dnt-text-muted)`
- 按钮宽度：140px
- 上边距：12px

---

#### 板块2：功能管理

**板块容器**
- 类名：`.dnt-list-block`
- 背景：`var(--dnt-bg-section)`
- 圆角：6px
- 内边距：16px

**板块标题**
- 类名：`.dnt-list-subtitle`
- 文字：功能管理
- 字号：14px
- 字重：600
- 颜色：`var(--dnt-text-primary)`
- 底部间距：12px

**功能项列表**
- 容器类名：`.dnt-toolbar-actions-list`
- 列表项类名：`.dnt-toolbar-action-item`
- 列表项间距：12px

**功能项行结构**
```
[拖拽手柄] [开关] [文字区域]
                   ├─ 功能名称（粗体）
                   └─ 功能说明（小字）
```

**功能项行样式**
- 背景：`var(--dnt-bg-input)`
- 圆角：6px
- 内边距：16px
- 边框：`1px solid var(--dnt-border)`
- 悬停：
  - 背景：`var(--dnt-bg-hover)`
  - 向右位移：4px（`transform: translateX(4px)`）
- 拖拽中：
  - 透明度：0.6
  - 阴影：`0 4px 12px rgba(0, 0, 0, 0.15)`
  - 光标：`grabbing`

**拖拽手柄**
- 图标：六个点排列成 2×3 网格（使用自定义SVG）
- SVG代码：
  ```
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="5" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="11" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="5" cy="8" r="1.5" fill="currentColor"/>
    <circle cx="11" cy="8" r="1.5" fill="currentColor"/>
    <circle cx="5" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="11" cy="12" r="1.5" fill="currentColor"/>
  </svg>
  ```
- 颜色：`var(--dnt-text-muted)`
- 悬停颜色：`var(--dnt-text-secondary)`
- 光标：`grab` / `grabbing`
- 移动端触摸热区：最小 44×44px

**开关**
- 使用现有 `.dnt-toggle` 组件
- 尺寸：44px × 24px

**文字区域**
- 功能名称：
  - 字号：14px
  - 字重：600
  - 颜色：`var(--dnt-text-primary)`
- 功能说明：
  - 字号：12px
  - 颜色：`var(--dnt-text-secondary)`
  - 上边距：4px

**功能项配置**

| 默认顺序 | 功能名称 | 功能说明 | 默认状态 |
|---------|---------|---------|---------|
| 1 | 回到顶部 | 快速返回页面顶部 | 开启 |
| 2 | 模式切换 | 切换后台打开模式 | 开启 |
| 3 | 打开设置 | 打开脚本设置面板 | 开启 |

**重置按钮**
- 按钮类名：`.dnt-btn .dnt-btn-secondary`
- 按钮文字：重置功能配置
- 提示文字（按钮下方）：恢复到默认开关状态和排序
- 提示字号：12px
- 提示颜色：`var(--dnt-text-muted)`
- 按钮宽度：160px
- 上边距：12px

**移动端适配**（< 768px）
- 按钮全宽显示
- 文字区域允许折行，最多 2 行

---

#### 板块3：模式切换设置（条件显示）

**显示条件**
- 仅在"模式切换"功能开启时显示
- 使用 JavaScript 控制可见性（`display: none` / `display: block`）

**板块容器**
- 类名：`.dnt-list-block`
- 背景：`var(--dnt-bg-section)`
- 圆角：6px
- 内边距：16px

**板块标题**
- 类名：`.dnt-list-subtitle`
- 文字：模式切换设置
- 字号：14px
- 字重：600
- 颜色：`var(--dnt-text-primary)`
- 底部间距：12px

**提示信息**
- 类名：`.dnt-info-box`
- 背景：`var(--dnt-bg-section)`
- 左边框：`3px solid var(--dnt-primary)`
- 圆角：4px
- 内边距：12px 14px
- 图标：`information-circle`（Heroicons），颜色 `var(--dnt-primary)`
- 文字：至少选择 2 个模式才能进行切换
- 字号：13px
- 颜色：`var(--dnt-text-secondary)`

**模式卡片选择器**
- 复用现有 `.dnt-mode-cards` 组件
- 三个模式卡片：none、topic、all

**模式卡片配置**

| 模式代码 | 模式名称 | 图标 | 说明文字 |
|---------|---------|------|---------|
| none | 不后台打开 | 空心圆（自定义SVG） | 保持默认行为 |
| topic | 仅主题帖 | `bars-3`（Heroicons） | 仅主题帖后台打开 |
| all | 全部后台打开 | `squares-2x2`（Heroicons） | 所有链接后台打开 |

---

#### 板块4：调试设置（新增）

**板块容器**
- 类名：`.dnt-list-block`
- 背景：`var(--dnt-bg-section)`
- 圆角：6px
- 内边距：16px

**板块标题**
- 类名：`.dnt-list-subtitle`
- 文字：调试设置
- 字号：14px
- 字重：600
- 颜色：`var(--dnt-text-primary)`
- 底部间距：12px

**开关行：启用工具栏调试**
- 类名：`.dnt-toggle-row`
- 标签：启用工具栏调试
- 说明：开启后在浏览器控制台输出工具栏相关调试信息
- 默认状态：关闭

---

### 2.3 跳转规则设置界面调整

**分类导航名称**
- 保持：跳转规则

**内容结构调整**
- 在现有跳转规则内容之前，新增一个板块："后台打开模式"

---

#### 板块1：后台打开模式（新增）

**板块容器**
- 类名：`.dnt-list-block`
- 背景：`var(--dnt-bg-section)`
- 圆角：6px
- 内边距：16px
- 位置：位于跳转规则分类的第一个板块

**板块标题**
- 类名：`.dnt-list-subtitle`
- 文字：当前后台打开模式
- 说明文字：选择当前生效的后台打开模式
- 字号：14px
- 字重：600
- 颜色：`var(--dnt-text-primary)`
- 底部间距：12px

**分段控制器**
- 复用现有 `.dnt-segmented-control` 组件
- 三个选项：none、topic、all
- 配置同悬浮工具栏的模式卡片

---

#### 板块2：跳转规则（原有）

保持现有结构不变，包含多个规则组（主题帖规则、用户规则、附件规则、弹窗规则、侧边栏规则）。

---

## 三、图标清单

本工具栏使用 **Heroicons v2.1.5**（Outline 24×24 风格）作为主要图标来源。

**Heroicons 图标**
- `arrow-up`：向上箭头
- `cog-6-tooth`：六齿轮设置
- `bars-3`：三横线列表
- `squares-2x2`：2×2网格
- `squares-plus`：带加号的方格（分类图标）
- `information-circle`：信息提示圈

**自定义图标**
- `circle-outline`：空心圆（模式：none）
  ```
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="8"/>
  </svg>
  ```
- `drag-handle`：拖拽手柄（六点网格）
  ```
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="5" cy="4" r="1.5"/>
    <circle cx="11" cy="4" r="1.5"/>
    <circle cx="5" cy="8" r="1.5"/>
    <circle cx="11" cy="8" r="1.5"/>
    <circle cx="5" cy="12" r="1.5"/>
    <circle cx="11" cy="12" r="1.5"/>
  </svg>
  ```

---

## 四、文案清单

### 4.1 悬浮工具栏

**Tooltip 文案**
- 回到顶部
- 不后台打开
- 仅主题帖
- 全部后台打开
- 打开设置

### 4.2 设置界面 - 悬浮工具栏分类

**分类名称**
- 悬浮工具栏

**板块标题**
- 基础设置
- 功能管理
- 模式切换设置
- 调试设置

**开关标签**
- 显示悬浮工具栏
- 启用工具栏调试

**开关说明**
- 关闭后工具栏将完全隐藏
- 开启后在浏览器控制台输出工具栏相关调试信息

**按钮文字**
- 重置位置
- 重置功能配置

**提示文字**
- 恢复到默认位置（右下角）
- 恢复到默认开关状态和排序
- 至少选择 2 个模式才能进行切换

**功能项**
- 回到顶部 / 快速返回页面顶部
- 模式切换 / 切换后台打开模式
- 打开设置 / 打开脚本设置面板

**模式选项**
- 不后台打开 / 保持默认行为
- 仅主题帖 / 仅主题帖后台打开
- 全部后台打开 / 所有链接后台打开

### 4.3 设置界面 - 跳转规则分类

**新增板块标题**
- 后台打开模式

---

## 五、交互动画规范

### 5.1 悬浮工具栏

**出现/消失**
- 入场：淡入 + 向上滑入，时长 0.3s
- 出场：淡出 + 向下滑出，时长 0.3s
- 缓动：`cubic-bezier(0.4, 0, 0.2, 1)`

**按钮交互**
- 悬停：缩放至 1.08，背景变色，时长 0.2s
- 点击：缩放至 0.95，时长 0.1s
- 松开：恢复至 1.0，时长 0.1s

**拖拽交互**
- 拖拽中：工具栏跟随鼠标，无过渡
- 放下：位置回弹校正，时长 0.2s，缓动 `ease-out`

### 5.2 设置界面

**功能项拖拽**
- 拾取：透明度降至 0.6，添加阴影，时长 0.15s
- 拖拽中：跟随鼠标，其他项目让位动画 0.2s
- 放下：透明度恢复，阴影消失，时长 0.2s

**开关切换**
- 滑块位移：时长 0.3s，缓动 `ease-in-out`
- 背景颜色：时长 0.3s

**按钮点击**
- 按下：背景加深，时长 0.1s
- 松开：恢复，时长 0.1s

---

## 六、可访问性

### 6.1 触摸目标
- 所有可点击元素最小尺寸：44px × 44px
- 移动端按钮保持 44px 尺寸

### 6.2 对比度
- 所有文字与背景对比度 ≥ 4.5:1（符合 WCAG AA）
- 使用 CSS 变量确保主题切换后对比度达标

---

**文档版本**：2.0
**更新日期**：2025-11-04
**文档用途**：为开发提供完整、精确、不留设计空间的UI实现规范
