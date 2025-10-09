# 接口文档（进行中）

本文档描述当前已实现模块的对外接口（供设置界面与后续功能复用）。

## 站点识别（siteDetector）
- 文件：`src/detectors/siteDetector.ts`
- 函数：
  - `detectDiscourse(doc?: Document, win?: Window): DetectResult`
    - 返回：`{ isDiscourse: boolean; score: number; threshold: number; matchedSignals: { name: string; weight: number; note?: string }[] }`
    - 说明：多信号加权识别 Discourse，阈值 `threshold = 3`
  - `isDiscourseSite(): boolean`
    - 返回：布尔，表示是否识别为 Discourse（异常时保守返回 false）

## 白/黑名单存储（domainLists）
- 文件：`src/storage/domainLists.ts`
- 约定：按域名（`location.hostname`）精确匹配；统一归一化：小写、去端口
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
    - 判定优先级：白名单 > 黑名单 > 自动识别；否则禁用

## GM 存储封装（gm）
- 文件：`src/storage/gm.ts`
- 作用：统一调用 `GM_*` 接口，缺失时降级为 `localStorage`（开发友好）
- 函数：
  - `gmGet<T>(key: string, def?: T): Promise<T | undefined>`
  - `gmSet<T>(key: string, value: T): Promise<void>`
  - `gmDelete(key: string): Promise<void>`
  - `gmList(): Promise<string[]>`
  - `gmRegisterMenu(label: string, cb: () => void): void`

## 规则与决策
- 文件：
  - `src/decision/types.ts`：动作与规则类型定义（`Action`/`Rule`/`Decision`/`LinkContext`）
  - `src/decision/engine.ts`：规则决策引擎（按序评估，后者优先；均不匹配→`keep_native`）
  - `src/rules/topic.ts`：主题帖三条规则
  - `src/rules/user.ts`：个人主页三条规则
  - `src/rules/attachment.ts`：附件规则
  - `src/rules/index.ts`：汇总全部规则（数组顺序代表优先级）

- 主题帖规则（默认启用；靠后优先）：
  1) 任意页→主题帖：`new_tab`（关=保留原生）
  2) 主题内→其他链接：`new_tab`（关=保留原生）
  3) 同主题楼层跳转：`keep_native`（关=新标签）

- 个人主页规则（默认启用；靠后优先）：
  1) 任意页→个人主页：`new_tab`（关=保留原生）
  2) 个人主页内→其他链接：`new_tab`（关=保留原生）
  3) 同一用户主页：`keep_native`（关=新标签）

- 附件规则（放在最后以覆盖前面判断）：
  - 附件链接：`keep_native`（关=新标签）

## 链接监听与 URL 工具
- 文件：
  - `src/listeners/click.ts`：左键无修饰点击委托，调用规则引擎执行动作
  - `src/utils/url.ts`：`toAbsoluteUrl`、`extractTopicId`、`extractUsername`、`isLikelyAttachment`

## 规则设置与调试
- 文件：
  - `src/storage/settings.ts`：规则开关持久化与默认值（可独立开关）
  - `src/debug/ruleMenu.ts`：调试菜单（仅调试模式显示）
