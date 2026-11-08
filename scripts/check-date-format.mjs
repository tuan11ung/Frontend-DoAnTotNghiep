import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const loadModule = createRequire(import.meta.url);
const ts = loadModule(path.join(root, 'node_modules/typescript'));
const source = fs.readFileSync(path.join(root, 'src/shared/utils/date-format.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const transpiledModule = { exports: {} };
new Function('module', 'exports', compiled)(transpiledModule, transpiledModule.exports);
const { formatDisplayDate, formatDisplayDateTime } = transpiledModule.exports;

const cases = [
  ['2026-01-02', '02/01/2026'], ['2026-11-08', '08/11/2026'],
  ['2024-02-29', '29/02/2024'], ['2000-02-29', '29/02/2000'],
  ['0099-01-02', '02/01/0099'], ['2/1/2026', '02/01/2026'],
  ['12 Th12, 2019', '12/12/2019'], ['05 Th8, 2022', '05/08/2022'],
  ['2026-12-31T18:00:00Z', '01/01/2027'],
  ['2026-01-01T01:00:00+14:00', '31/12/2025'],
  ['2026-11-08T00:30:00', '08/11/2026'],
  ['2026-11-08 00:30:00', '08/11/2026'],
];
const previousZone = process.env.TZ;
try {
  for (const zone of ['UTC', 'America/Los_Angeles', 'Asia/Ho_Chi_Minh']) {
    process.env.TZ = zone;
    for (const [input, expected] of cases) assert.equal(formatDisplayDate(input), expected, `${zone}: ${input}`);
    assert.equal(formatDisplayDateTime('2026-12-31T18:05:06Z'), '01/01/2027 01:05');
    assert.equal(formatDisplayDateTime('2026-12-31T18:05:06Z', true), '01/01/2027 01:05:06');
    assert.equal(formatDisplayDateTime('2026-11-08T09:10:11'), '08/11/2026 09:10');
    assert.equal(formatDisplayDate(new Date('2026-12-31T18:00:00Z')), '01/01/2027');
  }
} finally { if (previousZone === undefined) delete process.env.TZ; else process.env.TZ = previousZone; }
for (const value of [null, undefined, '', ' ', 'invalid', '08/11', '0000-01-01', '2026-02-29', '2026-02-30T00:00:00Z', '1900-02-29', '2026-13-01', '2026-00-10', '31/04/2026', '2026-01-00', new Date(NaN)]) {
  assert.equal(formatDisplayDate(value), '—'); assert.equal(formatDisplayDateTime(value), '—');
}
console.log('PASS DD/MM/YYYY, leap days, legacy article dates, invalid/missing values, year boundaries and Vietnam timestamps across 3 host time zones');
