/* parcel-tracker-bd unit tests (node). Run: node --test tests/unit.test.js */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/logic.js');

function parcel(over) {
  return Object.assign({ id: 'p1', trackingId: 'RX1', courier: 'RedX',
    sender: 'Shop', item: 'Book', codPaisa: 0, expectedDate: '2026-10-20',
    note: '', status: 'Booked',
    history: [{ status: 'Booked', at: '2026-10-17T00:00:00.000Z' }],
    createdAt: '2026-10-17T00:00:00.000Z',
    updatedAt: '2026-10-17T00:00:00.000Z' }, over || {});
}

test('transition legality: every legal pair allowed', () => {
  const legal = [['Booked', 'Picked Up'], ['Booked', 'Cancelled'],
    ['Picked Up', 'In Transit'], ['Picked Up', 'Cancelled'],
    ['In Transit', 'Out for Delivery'], ['In Transit', 'Returned'],
    ['In Transit', 'Cancelled'],
    ['Out for Delivery', 'Delivered'], ['Out for Delivery', 'Returned'],
    ['Out for Delivery', 'Cancelled']];
  for (const [from, to] of legal) assert.equal(L.canTransition(from, to), true, from + '->' + to);
  assert.equal(legal.length, 10);
});

test('transition legality: illegal pairs rejected', () => {
  const illegal = [['Booked', 'Delivered'], ['Booked', 'In Transit'],
    ['Booked', 'Out for Delivery'], ['Booked', 'Returned'],
    ['Booked', 'Booked'], ['Picked Up', 'Booked'],
    ['Picked Up', 'Delivered'], ['Picked Up', 'Out for Delivery'],
    ['In Transit', 'Booked'], ['In Transit', 'Picked Up'],
    ['In Transit', 'Delivered'],
    ['Out for Delivery', 'Booked'], ['Out for Delivery', 'Picked Up'],
    ['Out for Delivery', 'In Transit'],
    ['Delivered', 'Returned'], ['Delivered', 'Booked'],
    ['Returned', 'Delivered'], ['Cancelled', 'Booked'],
    ['Delivered', 'Delivered'], ['Returned', 'Returned'],
    ['Cancelled', 'Cancelled'], ['Nope', 'Delivered'],
    ['Booked', 'Nope']];
  for (const [from, to] of illegal) assert.equal(L.canTransition(from, to), false, from + '->' + to);
  assert.equal(illegal.length, 23);
});

test('nextStatuses and isTerminal', () => {
  assert.deepEqual(L.nextStatuses('Booked'), ['Picked Up', 'Cancelled']);
  assert.deepEqual(L.nextStatuses('In Transit'), ['Out for Delivery', 'Returned', 'Cancelled']);
  assert.deepEqual(L.nextStatuses('Delivered'), []);
  assert.deepEqual(L.nextStatuses('Returned'), []);
  assert.deepEqual(L.nextStatuses('Cancelled'), []);
  assert.equal(L.isTerminal('Delivered'), true);
  assert.equal(L.isTerminal('Returned'), true);
  assert.equal(L.isTerminal('Cancelled'), true);
  assert.equal(L.isTerminal('Booked'), false);
  assert.equal(L.isTerminal('Out for Delivery'), false);
});

test('applyTransition appends history only when legal', () => {
  const p = parcel();
  const next = L.applyTransition(p, 'Picked Up', '2026-10-17T01:00:00.000Z');
  assert.equal(next.status, 'Picked Up');
  assert.equal(next.history.length, 2);
  assert.equal(next.history[1].status, 'Picked Up');
  assert.equal(p.status, 'Booked'); // original untouched
  assert.equal(L.applyTransition(p, 'Delivered'), null);
  assert.equal(L.applyTransition(parcel({ status: 'Delivered' }), 'Returned'), null);
});

test('overdue rules', () => {
  // Hand-verified: today = 2026-10-17.
  assert.equal(L.isOverdue(parcel({ expectedDate: '2026-10-16', status: 'In Transit' }), '2026-10-17'), true);
  assert.equal(L.isOverdue(parcel({ expectedDate: '2026-10-16', status: 'Booked' }), '2026-10-17'), true);
  assert.equal(L.isOverdue(parcel({ expectedDate: '2026-10-16', status: 'Out for Delivery' }), '2026-10-17'), true);
  assert.equal(L.isOverdue(parcel({ expectedDate: '2026-10-16', status: 'Delivered' }), '2026-10-17'), false);
  assert.equal(L.isOverdue(parcel({ expectedDate: '2026-10-16', status: 'Returned' }), '2026-10-17'), false);
  assert.equal(L.isOverdue(parcel({ expectedDate: '2026-10-16', status: 'Cancelled' }), '2026-10-17'), false);
  assert.equal(L.isOverdue(parcel({ expectedDate: '2026-10-17', status: 'In Transit' }), '2026-10-17'), false);
  assert.equal(L.isOverdue(parcel({ expectedDate: '2026-10-18', status: 'In Transit' }), '2026-10-17'), false);
  assert.equal(L.isOverdue(parcel({ expectedDate: '', status: 'In Transit' }), '2026-10-17'), false);
});

test('COD sums: pending vs collected with mixed statuses', () => {
  // Hand-verified: Booked 100000 + In Transit 250050 + Out for Delivery 5000
  // = 355050 pending; Delivered 75025 collected; Returned/Cancelled excluded.
  const ps = [
    parcel({ id: 'a', status: 'Booked', codPaisa: 100000 }),
    parcel({ id: 'b', status: 'In Transit', codPaisa: 250050 }),
    parcel({ id: 'c', status: 'Out for Delivery', codPaisa: 5000 }),
    parcel({ id: 'd', status: 'Delivered', codPaisa: 75025 }),
    parcel({ id: 'e', status: 'Returned', codPaisa: 99999 }),
    parcel({ id: 'f', status: 'Cancelled', codPaisa: 12345 }),
    parcel({ id: 'g', status: 'Picked Up', codPaisa: 0 })
  ];
  const d = L.computeDashboard(ps, '2026-10-17');
  assert.equal(d.total, 7);
  assert.equal(d.inTransit, 3); // Picked Up + In Transit + Out for Delivery
  assert.equal(d.delivered, 1);
  assert.equal(d.codPendingPaisa, 355050);
  assert.equal(d.codCollectedPaisa, 75025);
  assert.equal(d.overdue, 0);
  const d2 = L.computeDashboard([], '2026-10-17');
  assert.deepEqual(d2, { total: 0, inTransit: 0, delivered: 0,
    codPendingPaisa: 0, codCollectedPaisa: 0, overdue: 0 });
});

test('COD parser: integer-paisa math, no floats', () => {
  assert.equal(L.parseCodToPaisa(''), 0);
  assert.equal(L.parseCodToPaisa('1500'), 150000);
  assert.equal(L.parseCodToPaisa('1500.5'), 150050);
  assert.equal(L.parseCodToPaisa('1500.50'), 150050);
  assert.equal(L.parseCodToPaisa('0.01'), 1);
  assert.equal(L.parseCodToPaisa('0.10'), 10);
  assert.equal(L.parseCodToPaisa('  99.99  '), 9999);
  assert.equal(L.parseCodToPaisa('-5'), null);
  assert.equal(L.parseCodToPaisa('12.345'), null);
  assert.equal(L.parseCodToPaisa('abc'), null);
  assert.equal(L.parseCodToPaisa('12.'), null);
  assert.equal(L.parseCodToPaisa('.5'), null);
  assert.equal(L.parseCodToPaisa('1,500'), null);
  assert.equal(L.parseCodToPaisa(null), null);
});

test('money formatting', () => {
  assert.equal(L.formatPaisa(150050), '1,500.50');
  assert.equal(L.formatPaisa(0), '0.00');
  assert.equal(L.formatPaisa(5), '0.05');
  assert.equal(L.formatPaisa(123456789), '1,234,567.89');
  assert.equal(L.formatMoney(150050, 'en'), '\u09F31,500.50');
  // Bengali digits: 1,500.50 -> \u09E7,\u09EB\u09E6\u09E6.\u09EB\u09E6
  assert.equal(L.formatMoney(150050, 'bn'), '\u09F3\u09E7,\u09EB\u09E6\u09E6.\u09EB\u09E6');
  assert.equal(L.formatCount(123, 'bn'), '\u09E7\u09E8\u09E9');
  assert.equal(L.toBengaliDigits('2026-10-17'), '\u09E8\u09E6\u09E8\u09EC-\u09E7\u09E6-\u09E7\u09ED');
});

test('date validation', () => {
  assert.equal(L.isValidDateStr('2026-10-17'), true);
  assert.equal(L.isValidDateStr('2026-02-29'), false); // 2026 not a leap year
  assert.equal(L.isValidDateStr('2024-02-29'), true); // leap year
  assert.equal(L.isValidDateStr('2026-13-01'), false);
  assert.equal(L.isValidDateStr('2026-10-32'), false);
  assert.equal(L.isValidDateStr('17-10-2026'), false);
  assert.equal(L.isValidDateStr(''), false);
  assert.equal(L.isValidDateStr(null), false);
});

test('validateParcelInput: valid + duplicate tracking rejected', () => {
  const existing = [parcel({ id: 'x', trackingId: 'RX123' })];
  const good = L.validateParcelInput({ trackingId: ' RX999 ', courier: 'RedX',
    sender: 'Shop', item: 'Saree', codText: '1500.50',
    expectedDate: '2026-10-20', note: 'Call first' }, existing, null);
  assert.equal(good.ok, true);
  assert.equal(good.cleaned.trackingId, 'RX999');
  assert.equal(good.cleaned.codPaisa, 150050);
  const dup = L.validateParcelInput({ trackingId: 'rx123', courier: 'RedX',
    sender: '', item: '', codText: '0', expectedDate: '', note: '' },
    existing, null);
  assert.equal(dup.ok, false);
  assert.ok(dup.errors.includes('ERR_TRACKING_DUPLICATE'));
  // Same tracking allowed when editing the same parcel.
  const selfEdit = L.validateParcelInput({ trackingId: 'RX123', courier: 'RedX',
    sender: '', item: '', codText: '0', expectedDate: '', note: '' },
    existing, 'x');
  assert.equal(selfEdit.ok, true);
  const missing = L.validateParcelInput({ trackingId: '', courier: 'RedX',
    sender: '', item: '', codText: '0', expectedDate: '', note: '' }, [], null);
  assert.ok(missing.errors.includes('ERR_TRACKING_REQUIRED'));
  const badCourier = L.validateParcelInput({ trackingId: 'A1', courier: 'DHL',
    sender: '', item: '', codText: '0', expectedDate: '', note: '' }, [], null);
  assert.ok(badCourier.errors.includes('ERR_COURIER'));
  const badCod = L.validateParcelInput({ trackingId: 'A1', courier: 'RedX',
    sender: '', item: '', codText: '1.234', expectedDate: '', note: '' }, [], null);
  assert.ok(badCod.errors.includes('ERR_COD'));
  const badDate = L.validateParcelInput({ trackingId: 'A1', courier: 'RedX',
    sender: '', item: '', codText: '0', expectedDate: '2026-02-30', note: '' }, [], null);
  assert.ok(badDate.errors.includes('ERR_DATE'));
});

test('createParcel starts Booked with one history entry', () => {
  const p = L.createParcel({ trackingId: 'T1', courier: 'Steadfast',
    sender: 'S', item: 'I', codPaisa: 5000, expectedDate: '2026-10-20',
    note: '' }, '2026-10-17T00:00:00.000Z');
  assert.equal(p.status, 'Booked');
  assert.equal(p.history.length, 1);
  assert.equal(p.history[0].status, 'Booked');
  assert.ok(p.id.startsWith('p_'));
});

test('filter + sort (Bengali-safe search)', () => {
  const ps = [
    parcel({ id: 'a', trackingId: 'RX1', sender: 'Rahim Store', item: 'Book',
      courier: 'RedX', codPaisa: 100, expectedDate: '2026-10-20',
      createdAt: '2026-10-15T00:00:00.000Z' }),
    parcel({ id: 'b', trackingId: 'ST2', sender: 'Karim', item: '\u09B6\u09BE\u09DC\u09BF',
      courier: 'Steadfast', codPaisa: 500, expectedDate: '2026-10-18',
      createdAt: '2026-10-16T00:00:00.000Z' }),
    parcel({ id: 'c', trackingId: 'PF3', sender: 'Rahim Store', item: 'Pen',
      courier: 'Paperfly', codPaisa: 300, expectedDate: '',
      createdAt: '2026-10-17T00:00:00.000Z' })
  ];
  assert.equal(L.filterParcels(ps, { query: 'rahim' }).length, 2);
  assert.equal(L.filterParcels(ps, { query: 'RX1' }).length, 1);
  // Bengali query matches Bengali item text.
  assert.equal(L.filterParcels(ps, { query: '\u09B6\u09BE\u09DC\u09BF' }).length, 1);
  assert.equal(L.filterParcels(ps, { courier: 'RedX' }).length, 1);
  assert.equal(L.filterParcels(ps, { status: 'Booked' }).length, 3);
  assert.equal(L.filterParcels(ps, { query: 'zzz' }).length, 0);
  assert.deepEqual(L.sortParcels(ps, 'newest').map(p => p.id), ['c', 'b', 'a']);
  assert.deepEqual(L.sortParcels(ps, 'oldest').map(p => p.id), ['a', 'b', 'c']);
  assert.deepEqual(L.sortParcels(ps, 'expected').map(p => p.id), ['b', 'a', 'c']);
  assert.deepEqual(L.sortParcels(ps, 'cod').map(p => p.id), ['b', 'c', 'a']);
});

test('import validation: valid round-trip', () => {
  const p = parcel({ status: 'In Transit',
    history: [{ status: 'Booked', at: '2026-10-17T00:00:00.000Z' },
      { status: 'Picked Up', at: '2026-10-17T01:00:00.000Z' },
      { status: 'In Transit', at: '2026-10-17T02:00:00.000Z' }] });
  const data = L.buildExport([p], '2026-10-17T00:00:00.000Z');
  assert.equal(data.app, 'parcel-tracker-bd');
  assert.equal(data.version, 1);
  const res = L.validateImport(JSON.parse(JSON.stringify(data)));
  assert.equal(res.ok, true);
  assert.equal(res.parcels.length, 1);
});

test('import validation: malformed cases rejected (12 cases)', () => {
  const good = parcel({ status: 'Booked' });
  const base = () => L.buildExport([good], '2026-10-17T00:00:00.000Z');
  const cases = [];
  const c1 = base(); c1.app = 'other-app'; cases.push(c1); // wrong app
  const c2 = base(); c2.version = 2; cases.push(c2); // wrong version
  const c3 = base(); c3.parcels = 'nope'; cases.push(c3); // parcels not array
  const c4 = base(); c4.parcels = [Object.assign({}, good, { status: 'Flying' })]; cases.push(c4); // bad status
  const c5 = base(); c5.parcels = [Object.assign({}, good, { codPaisa: 10.5 })]; cases.push(c5); // fractional COD
  const c6 = base(); c6.parcels = [Object.assign({}, good, { codPaisa: -1 })]; cases.push(c6); // negative COD
  const c7 = base(); c7.parcels = [Object.assign({}, good, { codPaisa: '100' })]; cases.push(c7); // COD wrong type
  const c8 = base(); c8.parcels = [Object.assign({}, good, { courier: 'DHL' })]; cases.push(c8); // bad courier
  const c9 = base(); c9.parcels = [good, Object.assign({}, good, { id: 'p2' })]; cases.push(c9); // duplicate tracking
  const c10 = base(); c10.parcels = [Object.assign({}, good, { expectedDate: '2026-02-30' })]; cases.push(c10); // bad date
  const c11 = base(); c11.parcels = [Object.assign({}, good, { history: [{ status: 'Picked Up', at: 'x' }] })]; cases.push(c11); // history must start Booked
  const c12 = base(); c12.parcels = [Object.assign({}, good, { history: [{ status: 'Booked', at: 'x' }, { status: 'Delivered', at: 'y' }], status: 'Delivered' })]; cases.push(c12); // illegal history chain
  assert.equal(cases.length, 12);
  for (let i = 0; i < cases.length; i++) {
    const res = L.validateImport(cases[i]);
    assert.equal(res.ok, false, 'case ' + (i + 1) + ' should be rejected');
    assert.equal(res.parcels, null);
  }
  assert.equal(L.validateImport(null).ok, false);
  assert.equal(L.validateImport('string').ok, false);
  assert.equal(L.validateImport([]).ok, false);
  // History last entry must equal parcel status.
  const c13 = base();
  c13.parcels = [Object.assign({}, good, { status: 'Picked Up',
    history: [{ status: 'Booked', at: 'x' }] })];
  assert.equal(L.validateImport(c13).ok, false);
});
