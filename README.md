# Discourse 新标签页（discourse-new-tab）

当前进度：
- 第 1 步（完成）：最小可运行版本（MVP），仅打印“脚本已加载”。
- 第 2 步（完成）：论坛识别模块（多信号加权，阈值 3）。
- 第 3 步（完成）：白/黑名单存储与菜单（开发期调试用）。
  - 优先级：黑名单 > 白名单 > 自动识别。
  - 菜单：始终保留“设置入口（占位）”；另外提供若干“【调试】”菜单，发布前可关闭。

## 开发与构建

1. 安装依赖（开发机需要 Node 16+）

```bash
npm i
```

2. 构建产物（生成 `dist/discourse-new-tab.user.js`）

```bash
npm run build
```

3. 开发模式（监听变更自动重建）

```bash
npm run dev
```

## 安装与验证（Tampermonkey）

1. 在浏览器安装 Tampermonkey 扩展。
2. 将 `dist/discourse-new-tab.user.js` 抛入浏览器或复制内容新建脚本进行安装。
3. 打开任意网页，打开开发者工具控制台，看到：

```
[discourse-new-tab] 脚本已加载（MVP）。
```

即可表示脚本正确注入。

另外你还会在控制台看到：
- 是否识别为 Discourse、得分/阈值、命中信号列表。
- 当前域名启用状态与原因（blacklist/whitelist/auto/disabled）。

在浏览器的 Tampermonkey 菜单中可看到：
- “设置入口（占位）”：暂未实现 GUI，仅占位。
- 若为开发版，还会看到“【调试】…”菜单，用于快捷增删白/黑名单与查看状态。

## 说明

- 源码（`src/`）与构建产物（`dist/`）分离，仓库不提交产物。
- 统一接口文档见：`docs/api.md`。
- 发布前可将 `src/main.ts` 中 `DEV_MENUS` 设为 `false`，仅保留“设置入口（占位）”。
- 后续步骤将逐条实现“统一决策中心 → 事件接入 → 各类规则 → 设置界面”。
