import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');

const excludedFiles = new Set([
  path.join(srcDir, 'shared/api/api.generated.ts'),
  path.join(srcDir, 'test/msw/handlers.ts'),
  path.join(srcDir, 'test/msw/native.ts'),
]);

const checks = [
  { name: 'backdrop-blur', regex: /\bbackdrop-blur\b/g },
  { name: 'gradient', regex: /\bbg-gradient\b/g },
  { name: 'gradient-stop', regex: /\b(?:from|via|to)-[a-z[]/g },
  { name: 'shadow-xl/2xl', regex: /\bshadow-(?:xl|2xl)\b/g },
  { name: 'rounded-xl/2xl/3xl', regex: /\brounded-(?:xl|2xl|3xl)\b/g },
  { name: 'hover:scale', regex: /\bhover:scale(?:-[^\s"'`}]*)?/g },
  { name: 'active:scale', regex: /\bactive:scale(?:-[^\s"'`}]*)?/g },
  { name: 'animate-bounce/pulse/ping', regex: /\banimate-(?:bounce|pulse|ping)\b/g },
  { name: 'bg-white/', regex: /\bbg-white\/\d+\b/g },
  { name: 'dark-utility', regex: /\bdark:[A-Za-z0-9_-]/g },
  { name: 'h-screen', regex: /\bh-screen\b/g },
  {
    name: 'raw-palette-color',
    regex:
      /\b(?:bg|text|border|ring|outline|fill|stroke|decoration|caret|accent|divide|placeholder|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d{1,3})?(?:\/\d{1,3})?\b/g,
    skipInIndexCss: true,
  },
];

const findings = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx|js|jsx|css|mjs|cjs)$/.test(entry)) continue;
    if (excludedFiles.has(full)) continue;
    if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(entry)) continue;
    scanFile(full);
  }
}

function scanFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const rel = path.relative(root, filePath);
  const lines = content.split(/\r?\n/);
  const isIndexCss = rel === 'src/index.css';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const check of checks) {
      if (check.skipInIndexCss && isIndexCss) continue;
      check.regex.lastIndex = 0;
      let match;
      while ((match = check.regex.exec(line)) !== null) {
        findings.push({
          file: rel,
          line: i + 1,
          column: match.index + 1,
          rule: check.name,
          match: match[0],
          text: line.trim(),
        });
      }
    }
  }
}

walk(srcDir);

if (findings.length > 0) {
  for (const f of findings) {
    console.error(`${f.file}:${f.line}:${f.column} [${f.rule}] ${f.match} :: ${f.text}`);
  }
  console.error(`\n${findings.length} banned pattern(s) found.`);
  process.exit(1);
}

console.log('No banned patterns found.');
