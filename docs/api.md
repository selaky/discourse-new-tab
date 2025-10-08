# 接口文档（进行中）

本文档描述当前已实现模块的对外接口（以便设置界面与后续功能复用）。

## 站点识别（siteDetector）
- 文件：`src/detectors/siteDetector.ts`
- 函数：
  - `detectDiscourse(doc?: Document, win?: Window): DetectResult`
    - 返回：`{ isDiscourse: boolean; score: number; threshold: number; matchedSignals: { name: string; weight: number; note?: string }[] }`
    - 说明：多信号加权识别 Discourse，阈值 `threshold=3`。
  - `isDiscourseSite(): boolean`
    - 返回：布尔，表示是否识别为 Discourse（异常时保守返回 false）。

## 白/黑名单存储（domainLists）
- 文件：`src/storage/domainLists.ts`
- 约定：按域名（`location.hostname`）精确匹配；统一归一化：小写、去端口。
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
    - 判定优先级：黑名单 > 白名单 > 自动识别；否则禁用。

## GM 存储封装（gm）
- 文件：`src/storage/gm.ts`
- 作用：统一调用 `GM_*` 接口，缺失时降级至 `localStorage`（开发友好）。
- 函数：
  - `gmGet<T>(key: string, def?: T): Promise<T | undefined>`
  - `gmSet<T>(key: string, value: T): Promise<void>`
  - `gmDelete(key: string): Promise<void>`
  - `gmList(): Promise<string[]>`
  - `gmRegisterMenu(label: string, cb: () => void): void`

## 未来接口占位（规划）
- 决策中心：`decide(link: HTMLAnchorElement, context: PageContext): Action`
  - `Action`: `'OPEN_NEW' | 'KEEP_NATIVE' | 'OPEN_SAME'`
  - 说明：各规则返回“建议 + 优先级”，由中心合并为最终动作。
- 事件接入：页面委托单点监听 `<a>` 点击，收集上下文后交由决策中心。
- 设置界面：通过上述 API 读取/写入白黑名单、切换规则开关等。

