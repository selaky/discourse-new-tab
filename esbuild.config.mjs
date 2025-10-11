import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const isWatch = process.argv.includes('--watch');

function readPkg() {
  const pkgPath = new URL('./package.json', import.meta.url);
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

function buildUserscriptBanner(pkg) {
  const us = pkg.userscript || {};
  const names = us.names || {};
  const descriptions = us.descriptions || {};

  const lines = [
    '// ==UserScript==',
    `// @name         ${names.zh || pkg.displayName || pkg.name}`,
    ...(names.en ? [`// @name:en      ${names.en}`] : []),
    ...(us.namespace ? [`// @namespace    ${us.namespace}`] : []),
    `// @version      ${pkg.version}`,
    `// @description  ${descriptions.zh || pkg.description || ''}`,
    ...(descriptions.en ? [`// @description:en ${descriptions.en}`] : []),
    ...(us.author || pkg.author ? [`// @author       ${us.author || pkg.author}`] : []),
    ...(us.homepageURL ? [`// @homepageURL  ${us.homepageURL}`] : []),
    ...(us.supportURL ? [`// @supportURL   ${us.supportURL}`] : []),
    ...(us.icon ? [`// @icon         ${us.icon}`] : []),
    ...(us.icon64 ? [`// @icon64       ${us.icon64}`] : []),
    ...(Array.isArray(us.match) ? us.match.map((m) => `// @match        ${m}`) : []),
    ...(Array.isArray(us.include) ? us.include.map((p) => `// @include      ${p}`) : []),
    ...(Array.isArray(us.exclude) ? us.exclude.map((p) => `// @exclude      ${p}`) : []),
    ...(Array.isArray(us.grant) ? us.grant.map((g) => `// @grant        ${g}`) : []),
    ...(us['run-at'] ? [`// @run-at       ${us['run-at']}`] : []),
    `// @license      ${us.license || pkg.license || ''}`,
    '// ==/UserScript=='
  ].filter(Boolean);

  return { js: lines.join('\n') + '\n' };
}

async function run() {
  try {
    const outFile = 'dist/discourse-new-tab.user.js';
    const outDir = path.dirname(outFile);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const pkg = readPkg();
    const options = {
      entryPoints: ['src/main.ts'],
      outfile: outFile,
      bundle: true,
      minify: false,
      format: 'iife',
      platform: 'browser',
      target: ['es2020'],
      banner: buildUserscriptBanner(pkg),
      sourcemap: false,
      legalComments: 'none',
      logLevel: 'info',
      loader: {
        '.css': 'text',
      },
      define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
      },
    };

    if (isWatch) {
      const ctx = await esbuild.context(options);
      await ctx.watch();
      console.log('构建已开启监视...');
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
