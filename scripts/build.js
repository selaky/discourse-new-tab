import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const distDir = path.resolve('dist');
mkdirSync(distDir, { recursive: true });

const metadata = `// ==UserScript==
// @name         Discourse Smart New Tab
// @namespace    https://github.com/yourname/discourse-new-tab
// @version      0.1.0
// @description  Automatically open Discourse topics in a new tab
// @author       your-name
// @match        *://*/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// ==/UserScript==`;

async function main() {
  try {
    await build({
      entryPoints: ['src/main.ts'],
      bundle: true,
      format: 'iife',
      target: ['es2020'],
      outfile: path.join(distDir, 'discourse-new-tab.user.js'),
      banner: { js: metadata + '\n' },
      legalComments: 'none',
      sourcemap: false,
      minify: false
    });
    console.log('UserScript build finished:', path.join(distDir, 'discourse-new-tab.user.js'));
  } catch (error) {
    console.error('Build failed', error);
    process.exit(1);
  }
}

main();