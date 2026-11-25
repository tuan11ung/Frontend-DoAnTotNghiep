import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function load(file, dependency) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  new Function('require', 'module', 'exports', code)(dependency, mod, mod.exports);
  return mod.exports;
}
const { paginationModel } = load('src/shared/components/pagination/pagination-model.ts', () => { throw Error('Unexpected import'); });
assert.deepEqual([paginationModel(0, 0, 20).from, paginationModel(0, 0, 20).to], [0, 0]);
assert.equal(paginationModel(0, 0, 20).canNext, false);
assert.equal(paginationModel(40, 1, 20).canNext, false);
assert.equal(paginationModel(41, 1, 20).canNext, true);
assert.deepEqual([paginationModel(41, 2, 20).from, paginationModel(41, 2, 20).to], [41, 41]);
assert.equal(paginationModel(21, 9, 20).pageIndex, 1);
assert.equal(paginationModel(21, 1, 50).pageIndex, 0);
assert.deepEqual(paginationModel(2000, 50, 20).pages, [0, 49, 50, 51, 99]);
console.log('PASS empty data, page boundaries, page-size changes, shrinking totals and bounded page buttons');

const jsx = (type, props) => ({ type, props });
const runtime = { jsx, jsxs: jsx };
function nodes(node) { return !node || typeof node !== 'object' ? [] : [node, ...[node.props?.children].flat(Infinity).flatMap(nodes)]; }
function find(node, predicate) { const match = nodes(node).find(predicate); assert.ok(match, 'Expected pagination control'); return match; }
const { DataTablePagination } = load('src/shared/components/pagination/DataTablePagination.tsx', id => {
  if (id === './pagination-model') return { paginationModel };
  if (id === './PaginationBar') return { PaginationBar: 'PaginationBar' };
  if (id === 'react/jsx-runtime') return runtime;
  if (id === 'lucide-react') return { ChevronLeft: 'ChevronLeft', ChevronRight: 'ChevronRight' };
  throw Error(id);
});
let changedPage, changedSize;
const props = { pageIndex: 1, pageSize: 20, totalRecords: 101, onPageChange: p => changedPage = p, onPageSizeChange: s => changedSize = s };
let tree = DataTablePagination(props);
find(tree, n => n.props?.['aria-label'] === 'Trang sau').props.onClick(); assert.equal(changedPage, 2);
find(tree, n => n.props?.['aria-label'] === 'Trang 1').props.onClick(); assert.equal(changedPage, 0);
find(tree, n => n.type === 'select').props.onChange({ target: { value: '50' } }); assert.equal(changedSize, 50);
find(tree, n => n.type === 'PaginationBar').props.onNext(); assert.equal(changedPage, 2);
changedPage = null; tree = DataTablePagination({ ...props, disabled: true });
find(tree, n => n.props?.['aria-label'] === 'Trang sau').props.onClick(); assert.equal(changedPage, null);
assert.equal(find(tree, n => n.type === 'select').props.disabled, true);
assert.equal(find(tree, n => n.props?.['aria-current'] === 'page').props['aria-label'], 'Trang 2');
console.log('PASS desktop/mobile callbacks, page-size selector, accessible current page and loading guards');

let request;
const { searchResourcePage } = load('src/features/facility-admin/api/resource-search.ts', id => {
  if (id === './admin-api-client') return { adminRequest: async (url, body, signal) => { request = { url, body, signal }; return { content: [], page: body.pageable.page, size: body.pageable.size, totalElements: 0, totalPages: 0 }; } };
  return { toRoom: x => x, toSpecialty: x => x, toStaff: x => x, toMedicalService: x => x };
});
const signal = new AbortController().signal;
for (const [kind, url] of [['room', 'rooms/search'], ['staff', 'staff/search'], ['service', 'medical-services/search']]) {
  await searchResourcePage(kind, ' test ', false, 2, signal, 'ALL', 50);
  assert.equal(request.url, url); assert.equal(request.body.pageable.page, 2); assert.equal(request.body.pageable.size, 50);
  assert.equal(request.body.keyword, 'test'); assert.equal(request.body.active, false); assert.equal(request.signal, signal);
}
await searchResourcePage('room', '', null, 0, signal, 'NONE', 10);
assert.equal(request.body.unassignedSpecialty, true);
await searchResourcePage('room', '', null, 0, signal, '3', 10);
assert.equal(request.body.specialtyId, 3);
console.log('PASS all three server endpoints forward page/size, filters and abort signal');

let state, cursor, effects;
const { ResourceListView } = load('src/features/facility-admin/components/ResourceListView.tsx', id => {
  if (id === 'react/jsx-runtime') return runtime;
  if (id === 'react') return { useState: initial => { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], next => { state[index] = typeof next === 'function' ? next(state[index]) : next; }]; }, useCallback: fn => fn, useMemo: fn => fn(), useEffect: fn => effects.push(fn) };
  if (id.endsWith('pagination-model')) return { paginationModel };
  if (id.endsWith('/pagination')) return { DataTablePagination: 'DataTablePagination' };
  if (id.endsWith('/resource-search')) return { searchResourcePage };
  if (id.endsWith('/facility-admin-data')) return { STAFF_ROLE_LABELS: { DOCTOR: 'Doctor' }, ROOM_TYPE_LABELS: {}, DEPARTMENT_TYPE_LABELS: {} };
  return new Proxy({}, { get: (_, key) => key });
});
const staff = Array.from({ length: 45 }, (_, id) => ({ id, active: true, fullName: `Staff ${id}`, staffCode: `S${id}`, email: '', roles: id > 40 ? ['DOCTOR'] : ['RECEPTIONIST'], status: 'ACTIVE' }));
const resourceProps = { kind: 'staff', items: staff, staff, specialties: [], departments: [], onAdd() {}, onEdit() {}, onToggle() {} };
function renderResource() { cursor = 0; effects = []; return ResourceListView(resourceProps); }
state = ['', 'ALL', 'DOCTOR', 'ALL', 8, 20, null, ''];
tree = renderResource();
const pagination = find(tree, n => n.type === 'DataTablePagination');
assert.equal(pagination.props.totalRecords, 4); assert.equal(pagination.props.pageIndex, 0);
pagination.props.onPageSizeChange(10); assert.equal(state[4], 0); assert.equal(state[5], 10);
state[4] = 2; tree = renderResource();
find(tree, n => n.type === 'select' && n.props.value === 'DOCTOR').props.onChange({ target: { value: 'ALL' } });
assert.equal(state[4], 0); assert.equal(state[6], null);
console.log('PASS staff roles filter the full catalog before pagination; size/filter changes reset to first page');
