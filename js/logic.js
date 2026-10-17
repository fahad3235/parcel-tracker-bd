/* parcel-tracker-bd -- pure logic, no DOM.
   Money is integer paisa (1 BDT = 100 paisa). No floats for money.
   Works in the browser (window.ParcelLogic) and under node (module.exports).
   All string literals here are pure ASCII. Bengali text lives in app.js
   as \uXXXX escapes only. */
(function (root) {
  'use strict';

  var APP = 'parcel-tracker-bd';
  var VERSION = 1;
  var STORAGE_KEY = 'parcel-tracker-bd:v1';
  var LANG_KEY = 'parcel-tracker-bd:lang';

  var STATUSES = ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery',
    'Delivered', 'Returned', 'Cancelled'];
  var TERMINAL_STATUSES = ['Delivered', 'Returned', 'Cancelled'];
  var TRANSITIONS = {
    'Booked': ['Picked Up', 'Cancelled'],
    'Picked Up': ['In Transit', 'Cancelled'],
    'In Transit': ['Out for Delivery', 'Returned', 'Cancelled'],
    'Out for Delivery': ['Delivered', 'Returned', 'Cancelled'],
    'Delivered': [],
    'Returned': [],
    'Cancelled': []
  };
  var COURIERS = ['Pathao Courier', 'Steadfast', 'RedX', 'Paperfly',
    'Sundarban Courier', 'SA Paribahan', 'eCourier', 'Other'];

  function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }

  function isValidDateStr(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var y = parseInt(s.slice(0, 4), 10);
    var m = parseInt(s.slice(5, 7), 10);
    var d = parseInt(s.slice(8, 10), 10);
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    var dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d;
  }

  // Local YYYY-MM-DD for a Date object (no timezone shift).
  function localDateStr(dt) {
    var y = dt.getFullYear();
    var m = String(dt.getMonth() + 1);
    var d = String(dt.getDate());
    if (m.length < 2) m = '0' + m;
    if (d.length < 2) d = '0' + d;
    return y + '-' + m + '-' + d;
  }

  function normalizeTracking(s) {
    return String(s == null ? '' : s).trim();
  }

  function trackingKey(s) {
    return normalizeTracking(s).toLowerCase();
  }

  // Strict COD parser: string like "1500", "1500.5", "1500.50".
  // Returns integer paisa, or null when invalid. Empty string -> 0.
  function parseCodToPaisa(text) {
    if (text === null || text === undefined) return null;
    var s = String(text).trim();
    if (s === '') return 0;
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
    var parts = s.split('.');
    var whole = parseInt(parts[0], 10);
    var frac = 0;
    if (parts.length === 2) {
      var f = parts[1];
      if (f.length === 1) frac = parseInt(f, 10) * 10;
      else frac = parseInt(f, 10);
    }
    var paisa = whole * 100 + frac;
    if (!isFinite(paisa) || paisa > 100000000000) return null;
    return paisa;
  }

  // Format integer paisa as "1,234.56" (integer math, comma groups).
  function formatPaisa(paisa) {
    var neg = paisa < 0;
    var abs = Math.abs(paisa);
    var whole = Math.floor(abs / 100);
    var frac = abs % 100;
    var fracStr = frac < 10 ? '0' + frac : String(frac);
    var wholeStr = String(whole);
    var grouped = '';
    while (wholeStr.length > 3) {
      grouped = ',' + wholeStr.slice(-3) + grouped;
      wholeStr = wholeStr.slice(0, -3);
    }
    grouped = wholeStr + grouped;
    return (neg ? '-' : '') + grouped + '.' + fracStr;
  }

  var BN_DIGITS = ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA',
    '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'];
  function toBengaliDigits(s) {
    return String(s).replace(/[0-9]/g, function (ch) {
      return BN_DIGITS[ch.charCodeAt(0) - 48];
    });
  }

  // Money display: Taka sign (\u09F3) + formatted amount. BN -> Bengali digits.
  function formatMoney(paisa, lang) {
    var base = '\u09F3' + formatPaisa(paisa);
    return lang === 'bn' ? toBengaliDigits(base) : base;
  }

  function formatCount(n, lang) {
    var s = String(n);
    return lang === 'bn' ? toBengaliDigits(s) : s;
  }

  function formatDateDisplay(dateStr, lang) {
    if (!dateStr) return '';
    return lang === 'bn' ? toBengaliDigits(dateStr) : dateStr;
  }

  function canTransition(from, to) {
    if (TRANSITIONS.hasOwnProperty(from)) {
      return TRANSITIONS[from].indexOf(to) !== -1;
    }
    return false;
  }

  function nextStatuses(status) {
    if (TRANSITIONS.hasOwnProperty(status)) return TRANSITIONS[status].slice();
    return [];
  }

  function isTerminal(status) {
    return TERMINAL_STATUSES.indexOf(status) !== -1;
  }

  // Overdue = expected date strictly before today AND status not terminal.
  function isOverdue(parcel, today) {
    if (!parcel || !parcel.expectedDate) return false;
    if (isTerminal(parcel.status)) return false;
    return parcel.expectedDate < today;
  }

  function computeDashboard(parcels, today) {
    var total = parcels.length;
    var inTransit = 0, delivered = 0, overdue = 0;
    var codPending = 0, codCollected = 0;
    for (var i = 0; i < parcels.length; i++) {
      var p = parcels[i];
      if (p.status === 'Picked Up' || p.status === 'In Transit' ||
          p.status === 'Out for Delivery') inTransit++;
      if (p.status === 'Delivered') delivered++;
      if (!isTerminal(p.status)) codPending += p.codPaisa;
      if (p.status === 'Delivered') codCollected += p.codPaisa;
      if (isOverdue(p, today)) overdue++;
    }
    return { total: total, inTransit: inTransit, delivered: delivered,
      codPendingPaisa: codPending, codCollectedPaisa: codCollected,
      overdue: overdue };
  }

  function validateParcelInput(input, existingParcels, excludeId) {
    var errors = [];
    var trackingId = normalizeTracking(input.trackingId);
    if (!trackingId) errors.push('ERR_TRACKING_REQUIRED');
    else if (trackingId.length > 60) errors.push('ERR_TRACKING_LENGTH');
    else {
      var key = trackingKey(trackingId);
      for (var i = 0; i < existingParcels.length; i++) {
        var ep = existingParcels[i];
        if (excludeId != null && ep.id === excludeId) continue;
        if (trackingKey(ep.trackingId) === key) {
          errors.push('ERR_TRACKING_DUPLICATE');
          break;
        }
      }
    }
    var courier = String(input.courier == null ? '' : input.courier).trim();
    if (COURIERS.indexOf(courier) === -1) errors.push('ERR_COURIER');
    var sender = String(input.sender == null ? '' : input.sender).trim();
    if (sender.length > 100) errors.push('ERR_SENDER_LENGTH');
    var item = String(input.item == null ? '' : input.item).trim();
    if (item.length > 200) errors.push('ERR_ITEM_LENGTH');
    var note = String(input.note == null ? '' : input.note).trim();
    if (note.length > 500) errors.push('ERR_NOTE_LENGTH');
    var codPaisa = parseCodToPaisa(input.codText);
    if (codPaisa === null) errors.push('ERR_COD');
    var expectedDate = String(input.expectedDate == null ? '' :
      input.expectedDate).trim();
    if (expectedDate !== '' && !isValidDateStr(expectedDate)) {
      errors.push('ERR_DATE');
    }
    if (errors.length > 0) return { ok: false, errors: errors, cleaned: null };
    return { ok: true, errors: [],
      cleaned: { trackingId: trackingId, courier: courier, sender: sender,
        item: item, codPaisa: codPaisa, expectedDate: expectedDate,
        note: note } };
  }

  function makeId() {
    var rand = '';
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'p_' + Date.now().toString(36) + '_' + rand;
  }

  function createParcel(cleaned, nowIso) {
    var now = nowIso || new Date().toISOString();
    return { id: makeId(), trackingId: cleaned.trackingId,
      courier: cleaned.courier, sender: cleaned.sender,
      item: cleaned.item, codPaisa: cleaned.codPaisa,
      expectedDate: cleaned.expectedDate, note: cleaned.note,
      status: 'Booked',
      history: [{ status: 'Booked', at: now }],
      createdAt: now, updatedAt: now };
  }

  // Returns a new parcel object, or null when the transition is illegal.
  function applyTransition(parcel, to, nowIso) {
    if (!parcel || !canTransition(parcel.status, to)) return null;
    var now = nowIso || new Date().toISOString();
    var next = {};
    var keys = Object.keys(parcel);
    for (var i = 0; i < keys.length; i++) next[keys[i]] = parcel[keys[i]];
    next.status = to;
    next.history = parcel.history.concat([{ status: to, at: now }]);
    next.updatedAt = now;
    return next;
  }

  function filterParcels(parcels, opts) {
    var query = String(opts.query || '').trim().toLowerCase();
    var courier = opts.courier || '';
    var status = opts.status || '';
    var out = [];
    for (var i = 0; i < parcels.length; i++) {
      var p = parcels[i];
      if (courier !== '' && p.courier !== courier) continue;
      if (status !== '' && p.status !== status) continue;
      if (query !== '') {
        var hay = (p.trackingId + ' ' + p.sender + ' ' + p.item).toLowerCase();
        if (hay.indexOf(query) === -1) continue;
      }
      out.push(p);
    }
    return out;
  }

  function sortParcels(parcels, sortKey) {
    var arr = parcels.slice();
    function cmpStr(a, b) { return a < b ? -1 : (a > b ? 1 : 0); }
    if (sortKey === 'oldest') {
      arr.sort(function (a, b) {
        return cmpStr(a.createdAt, b.createdAt) ||
          cmpStr(a.trackingId, b.trackingId);
      });
    } else if (sortKey === 'expected') {
      arr.sort(function (a, b) {
        var ae = a.expectedDate || '9999-12-31';
        var be = b.expectedDate || '9999-12-31';
        return cmpStr(ae, be) || cmpStr(a.createdAt, b.createdAt);
      });
    } else if (sortKey === 'cod') {
      arr.sort(function (a, b) {
        return (b.codPaisa - a.codPaisa) || cmpStr(a.createdAt, b.createdAt);
      });
    } else { // newest (default)
      arr.sort(function (a, b) {
        return cmpStr(b.createdAt, a.createdAt) ||
          cmpStr(a.trackingId, b.trackingId);
      });
    }
    return arr;
  }

  function buildExport(parcels, exportedAt) {
    return { app: APP, version: VERSION,
      exportedAt: exportedAt || new Date().toISOString(),
      count: parcels.length, parcels: parcels };
  }

  // Strict import validation. Any defect -> whole import rejected.
  function validateImport(data) {
    var errors = [];
    function fail(code) { errors.push(code); }
    if (!isPlainObject(data)) { fail('ERR_IMPORT_NOT_OBJECT'); return { ok: false, errors: errors, parcels: null }; }
    if (data.app !== APP) fail('ERR_IMPORT_APP');
    if (data.version !== VERSION) fail('ERR_IMPORT_VERSION');
    if (!Array.isArray(data.parcels)) fail('ERR_IMPORT_PARCELS');
    if (errors.length > 0) return { ok: false, errors: errors, parcels: null };
    var seenIds = {};
    var seenTracking = {};
    var parcels = data.parcels;
    for (var i = 0; i < parcels.length; i++) {
      var p = parcels[i];
      var pre = 'ERR_IMPORT_PARCEL_' + i + ':';
      if (!isPlainObject(p)) { fail(pre + 'NOT_OBJECT'); continue; }
      if (typeof p.id !== 'string' || p.id === '') fail(pre + 'ID');
      else if (seenIds[p.id]) fail(pre + 'DUP_ID');
      else seenIds[p.id] = true;
      if (typeof p.trackingId !== 'string' ||
          normalizeTracking(p.trackingId) === '' ||
          p.trackingId.length > 60) fail(pre + 'TRACKING');
      else {
        var tk = trackingKey(p.trackingId);
        if (seenTracking[tk]) fail(pre + 'DUP_TRACKING');
        else seenTracking[tk] = true;
      }
      if (COURIERS.indexOf(p.courier) === -1) fail(pre + 'COURIER');
      if (typeof p.sender !== 'string' || p.sender.length > 100) fail(pre + 'SENDER');
      if (typeof p.item !== 'string' || p.item.length > 200) fail(pre + 'ITEM');
      if (typeof p.note !== 'string' || p.note.length > 500) fail(pre + 'NOTE');
      if (typeof p.codPaisa !== 'number' || !isFinite(p.codPaisa) ||
          Math.floor(p.codPaisa) !== p.codPaisa || p.codPaisa < 0 ||
          p.codPaisa > 100000000000) fail(pre + 'COD');
      if (typeof p.expectedDate !== 'string' ||
          (p.expectedDate !== '' && !isValidDateStr(p.expectedDate))) {
        fail(pre + 'DATE');
      }
      if (STATUSES.indexOf(p.status) === -1) fail(pre + 'STATUS');
      if (typeof p.createdAt !== 'string' || p.createdAt === '') fail(pre + 'CREATED');
      if (typeof p.updatedAt !== 'string' || p.updatedAt === '') fail(pre + 'UPDATED');
      if (!Array.isArray(p.history) || p.history.length === 0) {
        fail(pre + 'HISTORY');
        continue;
      }
      var prev = null;
      var historyOk = true;
      for (var h = 0; h < p.history.length; h++) {
        var entry = p.history[h];
        if (!isPlainObject(entry) || STATUSES.indexOf(entry.status) === -1 ||
            typeof entry.at !== 'string' || entry.at === '') {
          fail(pre + 'HISTORY_ENTRY');
          historyOk = false;
          break;
        }
        if (h === 0 && entry.status !== 'Booked') {
          fail(pre + 'HISTORY_START');
          historyOk = false;
          break;
        }
        if (prev !== null && !canTransition(prev, entry.status)) {
          fail(pre + 'HISTORY_CHAIN');
          historyOk = false;
          break;
        }
        prev = entry.status;
      }
      if (historyOk && p.history.length > 0 &&
          p.history[p.history.length - 1].status !== p.status) {
        fail(pre + 'HISTORY_LAST');
      }
    }
    if (errors.length > 0) return { ok: false, errors: errors, parcels: null };
    return { ok: true, errors: [], parcels: parcels };
  }

  var api = { APP: APP, VERSION: VERSION, STORAGE_KEY: STORAGE_KEY,
    LANG_KEY: LANG_KEY, STATUSES: STATUSES,
    TERMINAL_STATUSES: TERMINAL_STATUSES, TRANSITIONS: TRANSITIONS,
    COURIERS: COURIERS, isPlainObject: isPlainObject,
    isValidDateStr: isValidDateStr, localDateStr: localDateStr,
    normalizeTracking: normalizeTracking, trackingKey: trackingKey,
    parseCodToPaisa: parseCodToPaisa, formatPaisa: formatPaisa,
    toBengaliDigits: toBengaliDigits, formatMoney: formatMoney,
    formatCount: formatCount, formatDateDisplay: formatDateDisplay,
    canTransition: canTransition, nextStatuses: nextStatuses,
    isTerminal: isTerminal, isOverdue: isOverdue,
    computeDashboard: computeDashboard,
    validateParcelInput: validateParcelInput, createParcel: createParcel,
    applyTransition: applyTransition, filterParcels: filterParcels,
    sortParcels: sortParcels, buildExport: buildExport,
    validateImport: validateImport };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.ParcelLogic = api;
  }
})(typeof window !== 'undefined' ? window : this);
