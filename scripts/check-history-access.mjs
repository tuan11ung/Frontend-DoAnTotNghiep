import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const loadModule = createRequire(import.meta.url); const ts = loadModule(path.join(root, 'node_modules/typescript'));
const source = fs.readFileSync(path.join(root, 'src/features/patient-profile/history-access/history-access-demo.ts'), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const compiledModule = { exports: {} }; new Function('module', 'exports', output)(compiledModule, compiledModule.exports);
const api = compiledModule.exports;
const values = new Map(); let fail = false; let changed = 0; let serial = Promise.resolve();
globalThis.window = new EventTarget(); window.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { if (fail) throw Error('quota'); values.set(key, value); } };
window.addEventListener('medconnect:patient-history-access-change', () => changed++);
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { locks: { request: (_, action) => { const result = serial.then(action); serial = result.catch(() => {}); return result; } } } });
const state = () => api.parseHistoryAccess(api.historyAccessSnapshot(), 1);
let passed = 0; const pass = text => { passed++; console.log(`PASS ${text}`); };

assert.equal(state().grants.filter(grant => !grant.closedAt).length, 2); assert.equal(state().views.length, 5);
assert.equal(api.parseHistoryAccess(api.INITIAL_HISTORY_ACCESS, 2), null);
for (const corrupt of [
  data => { data.grants[0].patientId = 2; }, data => { data.views[0].patientId = 2; },
  data => { data.views[0].visitId = 'foreign'; }, data => { data.views[0].viewedAt = '2000-01-01T00:00:00Z'; },
  data => { data.views[3].viewedAt = '2099-01-01T00:00:00Z'; }, data => { data.events.pop(); },
  data => { data.grants[2].closedBy = null; }, data => { data.visits[0].visitDate = '2026-02-30'; },
  data => { data.views.push(data.views[0]); }, data => { data.events[0].at = 'bad-date'; },
  data => { data.grants[0].openedAt = '2026-11-08'; }, data => { data.views[0].viewedAt = '1'; },
]) { const data = JSON.parse(api.INITIAL_HISTORY_ACCESS); corrupt(data); assert.equal(api.parseHistoryAccess(JSON.stringify(data), 1), null); }
pass('Fixtures and stored data preserve patient ownership, unique events and access-time bounds');
await assert.rejects(api.revokeHistoryAccessDemo(2, 'history-grant-1'));
await assert.rejects(api.revokeHistoryAccessDemo(1, 'foreign'));
assert.equal(values.size, 0); pass('Wrong patient and unknown grants cannot mutate data');
const before = api.historyAccessSnapshot(); const beforeEvents = changed; fail = true;
await assert.rejects(api.revokeHistoryAccessDemo(1, 'history-grant-1')); assert.equal(api.historyAccessSnapshot(), before); assert.equal(changed, beforeEvents); fail = false;
pass('Failed persistence cannot partially close a grant or broadcast success');
await api.recordHistoryViewDemo(1, 'history-grant-1', 'history-visit-3'); assert.equal(state().views.length, 6);
const historyBeforeClose = structuredClone(state().views);
const results = await Promise.all([api.revokeHistoryAccessDemo(1, 'history-grant-1'), api.revokeHistoryAccessDemo(1, 'history-grant-1')]);
assert.deepEqual(results.map(result => result.changed), [true, false]);
assert.equal(state().events.filter(event => event.grantId === 'history-grant-1' && event.kind === 'REVOKED').length, 1);
assert.equal(state().grants.find(grant => grant.id === 'history-grant-1').closedBy, 'PATIENT'); assert.deepEqual(state().views, historyBeforeClose);
await assert.rejects(api.recordHistoryViewDemo(1, 'history-grant-1', 'history-visit-1'));
pass('Concurrent revokes are idempotent, retain existing view history and deny new reads');
const aborted = new AbortController(); aborted.abort(); const saved = api.historyAccessSnapshot();
await assert.rejects(api.revokeHistoryAccessDemo(1, 'history-grant-2', aborted.signal)); assert.equal(api.historyAccessSnapshot(), saved);
const race = await Promise.allSettled([api.revokeHistoryAccessDemo(1, 'history-grant-2'), api.recordHistoryViewDemo(1, 'history-grant-2', 'history-visit-1')]);
assert.equal(race[0].status, 'fulfilled'); assert.equal(race[1].status, 'rejected'); assert.equal(state().grants.filter(grant => !grant.closedAt).length, 0);
pass('Cancelled actions do not write; a queued read cannot bypass revocation');
values.set(api.HISTORY_ACCESS_KEY, 'broken'); assert.equal(state(), null); await assert.rejects(api.revokeHistoryAccessDemo(1, 'history-grant-1')); assert.equal(values.get(api.HISTORY_ACCESS_KEY), 'broken');
pass('Corrupt storage fails visibly instead of restoring default open permissions');
console.log(`${passed} history-access integration groups passed`);
