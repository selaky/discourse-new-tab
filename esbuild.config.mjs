import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const isWatch = process.argv.includes('--watch');

const banner = {
  js: `// ==UserScript==\n`
    + `// @name         Discourse 新标签页\n`
    + `// @name:en      Discourse New Tab\n`
    + `// @namespace    https://github.com/your-username/discourse-new-tab\n`
    + `// @version      0.1.0\n`
    + `// @description  在 Discourse 论坛将指定链接在新标签页打开（逐步实现中）\n`
    + `// @author       You\n`
    + `// @match        http*://*/*\n`
    + `// @grant        GM_getValue\n`
    + `// @grant        GM_setValue\n`
    + `// @grant        GM_deleteValue\n`
    + `// @grant        GM_listValues\n`
    + `// @grant        GM_registerMenuCommand\n`
    + `// @run-at       document-start\n`
    + `// @license      MIT\n`
    + `// ==/UserScript==\n`,
};

async function run() {
  try {
    const outFile = 'dist/discourse-new-tab.user.js';
    const outDir = path.dirname(outFile);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const options = {
      entryPoints: ['src/main.ts'],
      outfile: outFile,
      bundle: true,
      minify: false,
      format: 'iife',
      platform: 'browser',
      target: ['es2020'],
      banner,
      sourcemap: false,
      legalComments: 'none',
      logLevel: 'info',
    };

    if (isWatch) {
      const ctx = await esbuild.context(options);
      await ctx.watch();
      console.log('构建开启监听...');
    } else {
      await esbuild.build(options);
      console.log('构建完成');
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
