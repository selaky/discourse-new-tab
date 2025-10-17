# 接口文档（全面版）

本文档系统性描述当前已实现模块的对外接口与行为约定，供设置界面与后续功能复用。内容与源码保持一致，并尽量清晰易懂。

- 目标平台：Tampermonkey
- 构建命令：`npm run build`（产物：`dist/discourse-new-tab.user.js`）

## 站点识别（siteDetector）
- 文件：`src/detectors/siteDetector.ts`
- 函数：
  - `detectDiscourse(doc?: Document, win?: Window): DetectResult`
    - 返回：`{ isDiscourse: boolean; score: number; threshold: number; matchedSignals: { name: string; weight: number; note?: string }[] }`
    - 说明：多信号加权识别 Discourse，阈值 `threshold = 3`；强/中/弱信号组合判断。
  - `isDiscourseSite(): boolean`
    - 返回：是否识别为 Discourse（异常时保守返回 `false`）。

## 白/黑名单存储（domainLists）
- 文件：`src/storage/domainLists.ts`
- 约定：按域名（`location.hostname`）精确匹配；统一归一化（小写、去端口）；支持通过设置菜单调试。
- 类型：
  - `type Lists = { whitelist: string[]; blacklist: string[] }`
  - `type EnableReason = 'blacklist' | 'whitelist' | 'auto' | 'disabled'`
  - `type EnableResult = { enabled: boolean; reason: EnableReason }`
- 函数：
  - `getLists(): Promise<Lists>`
  - `addToWhitelist(domain: string): Promise<{ added: boolean; list: string[] }>`
  - `removeFromWhitelist(domain: string): Promise<{ removed: boolean; list: string[] }>`
  - `addToBlacklist(domain: string): Promise<{ added: boolean; list: string[] }>`
  - `removeFromBlacklist(domain: string): Promise<{ removed: boolean; list: string[] }>`
  - `getCurrentHostname(): string`
  - `getEnablement(autoIsDiscourse: boolean, host?: string): Promise<EnableResult>`
    - 判定优先级：白名单 > 黑名单 > 自动识别；否则禁用。

## GM 存储封装（gm）
- 文件：`src/storage/gm.ts`
- 作用：统一调用 `GM_*` 接口，缺失时降级为 `localStorage`（开发/调试友好）。
- 函数：
  - `gmGet<T>(key: string, def?: T): Promise<T | undefined>`
  - `gmSet<T>(key: string, value: T): Promise<void>`
  - `gmDelete(key: string): Promise<void>`
  - `gmList(): Promise<string[]>`
  - `gmRegisterMenu(label: string, cb: () => void): void`

## 规则与决策
- 文件：
  - `src/decision/types.ts`：动作与规则类型定义
  - `src/decision/engine.ts`：规则决策引擎
  - `src/rules/*.ts`：各类规则模块（主题、个人主页、弹窗、附件）
  - `src/rules/index.ts`：汇总全部规则并定义全局评估顺序

### 类型定义（types.ts）
- `type Action = 'new_tab' | 'keep_native' | 'same_tab'`
- `interface LinkContext { anchor: HTMLAnchorElement; targetUrl: URL; currentUrl: URL; }`
- `type MatchResult = { matched: true; note?: string; data?: Record<string, any> } | null`
- `interface Rule { id: string; name: string; match(ctx: LinkContext): MatchResult; enabledAction: Action; disabledAction: Action; }`
- `interface Decision { action: Action; ruleId: string; debug?: { ruleName?: string; note?: string; data?: Record<string, any> } }`

### 决策引擎（engine.ts）
- `evaluateRules(rules: Rule[], ctx: LinkContext): Promise<Decision>`
  - 行为：顺序评估规则，凡 `match()` 返回 `null` 视为“不匹配”；匹配则根据开关决定动作（见 settings）。不提前返回，确保“靠后规则优先”。
  - 若所有规则均不匹配：返回 `{ action: 'keep_native', ruleId: 'default' }`。

### 设置与规则开关（settings.ts）
- 文件：`src/storage/settings.ts`
- 存储键：`ruleFlags`（对象映射：`Record<string, boolean>`）
- 默认值：全部启用（`true`）。
- 函数：
  - `getRuleFlags(): Promise<Record<string, boolean>>`
  - `getRuleEnabled(ruleId: string): Promise<boolean>`
  - `setRuleEnabled(ruleId: string, enabled: boolean): Promise<void>`
- 规则 ID 常量：
  - 主题帖：
    - `topic:open-new-tab`
    - `topic:in-topic-open-other`
    - `topic:same-topic-keep-native`
  - 个人主页：
    - `user:open-new-tab`
    - `user:in-profile-open-other`
    - `user:same-profile-keep-native`
  - 弹窗（大开关）：
    - `popup:user-card`
$1
    - `popup:search-menu-results`
  - 附件：
    - `attachment:keep-native`

### URL 工具（url.ts）
- 文件：`src/utils/url.ts`
- 函数：
  - `toAbsoluteUrl(href: string, base: string): URL | null`（相对→绝对，异常返回 `null`）
  - `extractTopicId(pathname: string): number | undefined`（覆盖 `/t/<slug>/<id>` 或 `/t/<id>` 等形态）
  - `extractUsername(pathname: string): string | undefined`（覆盖 `/u/<username>/...`）
  - `isLikelyAttachment(pathname: string): boolean`（基于 `/uploads/` 与常见扩展名）

### DOM 工具（dom.ts）
- 文件：`src/utils/dom.ts`
- 函数（选择器集合可按需扩展）：
  - `isInUserCard(el: Element | null): boolean`
  - `isInUserMenu(el: Element | null): boolean`
  - `isInUserMenuNav(el: Element | null): boolean`
  - `isInHeader(el: Element | null): boolean`
  - `isUserCardTrigger(a: HTMLAnchorElement): boolean`（常见头像/昵称触发卡片）
  - `isUserMenuTrigger(a: HTMLAnchorElement): boolean`（页头头像触发菜单）
  - `isActiveTab(a: HTMLAnchorElement): boolean`（菜单导航项是否为激活态）

### 规则模块（rules/*.ts）
- 汇总顺序：`src/rules/index.ts` 返回 `[...topicRules, ...userRules, ...attachmentRules, ...popupRules, ...sidebarRules]`；越靠后优先级越高。侧边栏位于最后，用于在侧边栏场景下覆盖前面规则。

#### 主题帖（topic.ts）
- 规则 1：`topic:open-new-tab`（任意页面 → 主题帖）
  - 启用：`new_tab`
  - 关闭：`keep_native`
- 规则 2：`topic:in-topic-open-other`（主题页内 → 其他链接：非本主题）
  - 启用：`new_tab`
  - 关闭：`keep_native`
- 规则 3：`topic:same-topic-keep-native`（同一主题内楼层跳转）
  - 启用：`keep_native`
  - 关闭：`new_tab`
- 解析：使用 `extractTopicId` 识别主题 ID；同主题判断优先级更高（排列在后）。

#### 个人主页（user.ts）
- 规则 1：`user:open-new-tab`（任意页面 → 个人主页）
  - 启用：`new_tab`
  - 关闭：`keep_native`
- 规则 2：`user:in-profile-open-other`（个人主页内 → 其他链接：非本用户主页）
  - 启用：`new_tab`
  - 关闭：`keep_native`
- 规则 3：`user:same-profile-keep-native`（同一用户主页）
  - 启用：`keep_native`
  - 关闭：`new_tab`
- 解析：使用 `extractUsername` 识别用户名；同用户主页判断优先级更高（排列在后）。

#### 弹窗（popup.ts）
- 大开关三项：`popup:user-card`、`popup:user-menu`、`popup:search-menu-results`；开启时按需改写，关闭时一律保留原生。
- 用户卡片（`popup:user-card`）：
  - 触发链接（头像/昵称）：`keep_native`（覆盖“个人主页=新标签”的规则，确保弹出卡片）
  - 卡片内任意链接：启用→`new_tab`；关闭→`keep_native`
- 用户菜单（`popup:user-menu`）：
  - 触发链接（页头头像）：`keep_native`
  - 导航区：未激活项→`keep_native`（切换面板）；激活项再次点击→启用时 `new_tab`，关闭时 `keep_native`
$1

- 搜索弹窗（`popup:search-menu-results`）：
  - 作用范围：仅“搜索弹窗中的结果列表与底部‘更多’按钮”。搜索历史、建议条目（未进入结果列表时）无论开关均保持原生。
  - 启用：`new_tab`
  - 关闭：`keep_native`
#### 附件（attachment.ts）
- 规则：`attachment:keep-native`（附件/文件链接）
  - 启用：`keep_native`
  - 关闭：`new_tab`
- 解析：`isLikelyAttachment` 判断 `/uploads/` 或常见扩展名。

#### 侧边栏（sidebar.ts）
- 规则 1：`sidebar:non-topic-keep-native`（非主题页内 → 侧边栏链接）
  - 启用：`keep_native`
  - 关闭：`new_tab`
  - 说明：当当前页面不是主题帖时，点击左侧分类导航等侧边栏内链接，保持站点原生行为；关闭该规则后改为新标签页打开。
- 规则 2：`sidebar:in-topic-open-new-tab`（主题页内 → 侧边栏链接）
  - 启用：`new_tab`
  - 关闭：`keep_native`
  - 说明：当当前页面是主题帖时，点击侧边栏内链接以新标签页打开；关闭该规则后改为保留原生行为。
-
 选择器解析：`utils/dom.ts` 提供 `isInSidebar(el)`，内部包含常见的侧边栏选择器集合（如 `#sidebar`、`.sidebar`、`.d-sidebar` 等），必要时可扩展。

## 事件监听（listeners/click）
- 文件：`src/listeners/click.ts`
- 行为：
  - 仅拦截左键无修饰点击（尊重 Ctrl/Meta/中键等原生意图）。
  - 定位 `<a>`：向上遍历 `tagName === 'A'`，避免跨 realm `instanceof` 问题。
  - 对 `download` 或 `data-dnt-ignore="1"` 的链接不拦截。
  - 将 `href` 规范化为绝对 URL，构造 `LinkContext` 并调用决策引擎。
  - 当决策为 `new_tab`：`preventDefault()` + `stopImmediatePropagation()` + `stopPropagation()`，并 `window.open(url, '_blank', 'noopener')`，防止旧标签页跟随跳转。
  - 其它动作：保持原生（`keep_native`）或保留为将来的 `same_tab`（未启用）。
  - 捕获阶段注册监听，尽早拦截站点脚本。

## 主入口（main.ts）
- 文件：`src/main.ts`
- 流程：
  - 顶层窗口打印心跳日志。
  - `detectDiscourse()` 打印识别结果与命中信号。
  - 使用 `getEnablement()` 结合白/黑名单与自动识别，决定是否启用。
  - 启用时挂载 `attachClickListener()`，统一由规则引擎处理跳转。
  - 注册“设置入口（占位）”菜单（GUI 未来接管）。
  - 调试模式（`DEV_MENUS=true`）下，注册白/黑名单与规则调试菜单。

## 调试菜单（debug/ruleMenu）
- 文件：`src/debug/ruleMenu.ts`
- 菜单项：
  - `【调试】查看规则开关`：打印当前所有规则开关对象。
  - 主题帖：
    - 切换 `topic:open-new-tab`
    - 切换 `topic:in-topic-open-other`
    - 切换 `topic:same-topic-keep-native`
  - 个人主页：
    - 切换 `user:open-new-tab`
    - 切换 `user:in-profile-open-other`
    - 切换 `user:same-profile-keep-native`
  - 弹窗：
    - 切换 `popup:user-card`
    - 切换 `popup:user-menu`
  - 附件：
    - 切换 `attachment:keep-native`

## 扩展与最佳实践
- 新增规则时：
  - 保持“单条规则不匹配时返回 `null`”的约定；避免误触发。
  - 在 `rules/index.ts` 合理安排顺序，确保“靠后优先”。
  - 解析 URL/DOM 时尽量复用 `utils/url.ts` 与 `utils/dom.ts`，方便集中维护与适配定制化论坛。
- 性能与安全：
  - 点击拦截与判断逻辑保持轻量；仅在需要时创建新 URL 或进行少量 DOM 查询。
  - `window.open(..., 'noopener')`，避免 `opener` 泄露。

