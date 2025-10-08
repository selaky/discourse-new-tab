# Discourse 新标签页（discourse-new-tab）

最小可运行版本（MVP）：安装脚本后仅打印“脚本已加载”心跳日志，不改动页面行为。后续将逐步实现规则、设置界面与发布。

## 开发与构建

1. 安装依赖（开发机需要 Node 16+）

```bash
npm i -D esbuild
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

即表示脚本正确注入（目前不改变任何页面行为）。

## 说明

- 源码（`src/`）与构建产物（`dist/`）分离，仓库不提交产物。
- 后续步骤将逐条实现“论坛识别”“白/黑名单”“统一决策中心”“规则分类”“设置界面”等。
