# Parcel Tracker BD

Offline bilingual (English / Bangla) courier parcel tracker for Bangladesh.
Track every parcel you send or receive -- with a strict status pipeline,
COD accounting in integer paisa, overdue detection, and strict JSON
export/import. Everything stays in your browser's localStorage. No server,
no account, no network requests.

## Problem

Online sellers and buyers in Bangladesh juggle parcels across many
couriers (Pathao, Steadfast, RedX, Paperfly, Sundarban, SA Paribahan,
eCourier). Each courier has its own tracking site, and none of them keeps
one combined list of *your* parcels with COD still to collect. This app is
that one combined list -- a personal, offline notebook for parcels.

## Features

1. **Parcel CRUD** -- tracking ID (required, unique), courier dropdown
   (8 couriers incl. Other), sender/shop name, item description, COD in
   BDT (integer-paisa math, 0 = prepaid), expected delivery date, note.
   Inline validation errors, in-place edit, delete with confirm.
2. **Status pipeline state machine** -- Booked -> Picked Up -> In Transit ->
   Out for Delivery -> Delivered / Returned / Cancelled (terminal). Only
   legal next transitions are offered as buttons. Every parcel keeps a
   status history log (status + timestamp) shown in its detail view.
3. **Dashboard** -- total parcels, in-transit count, delivered count,
   COD pending (non-terminal parcels), COD collected (Delivered),
   overdue count + overdue list. Overdue = expected date passed and
   status not terminal.
4. **Search + filter + sort** -- search tracking ID / sender / item
   (Bengali-safe), courier filter, status filter chips, sort by newest /
   oldest / expected date / COD. List cards show status badge, courier,
   COD, expected date, overdue flag.
5. **Data** -- JSON export + strict import (wrong app/version, bad types,
   duplicate tracking IDs, invalid status/COD/courier all rejected with
   existing data intact) + typed-DELETE erase-all. BN/EN toggle persisted
   in localStorage, Bengali digits rendering, `?asof=YYYY-MM-DD` override
   for deterministic date testing. Ships EMPTY (no demo parcels).

## Stack

- Pure HTML + CSS + vanilla JS (no framework, no bundler, no CDN).
- System fonts only. Zero network requests.
- Money stored as integer paisa (1 BDT = 100 paisa); no floats for money.
- Persistence: `localStorage` (`parcel-tracker-bd:v1` + `:lang`).

## Prerequisites

- Any modern browser (Chrome / Edge / Firefox / Safari).
- Node.js 18+ only for running the tests.

## Install

No install step. Open `index.html` in a browser, or serve the folder:

```sh
cd parcel-tracker-bd
python3 -m http.server 8000
# open http://localhost:8000/
```

## Dev commands

```sh
# unit tests (node:test)
node --test tests/unit.test.js

# headless-Chrome smoke tests (puppeteer-core + system Chromium)
node tests/smoke.mjs
```

## Env

None. No API keys, no secrets, no backend.

## Testing

- `tests/unit.test.js` -- pure-logic tests: transition legality (all
  legal/illegal pairs), overdue rules, COD pending/collected sums,
  import validation (12 malformed cases + type checks), duplicate
  tracking-ID rejection, date math, Bengali digits. See
  `TEST_RESULTS.md` for the recorded counts.
- `tests/smoke.mjs` -- headless-Chromium end-to-end: add parcel ->
  dashboard updates, illegal transition button absent, status advance,
  COD math in UI, search/filter/sort, BN toggle + persistence,
  export -> wipe -> import round-trip, malformed import rejected with data
  intact, typed-DELETE erase, 390px no-overflow on all views,
  0 console/page errors, 0 network requests.

## Deployment

Static site. Any static host works; for GitHub Pages, push the repo and
enable Pages on the `main` branch (root). No build step.

## Limitations

- **Not connected to any courier's live tracking system.** Statuses here
  are the ones *you* record. Verify a parcel's live status on the
  courier's own site.
- Data lives in one browser's localStorage; it does not sync across
  devices. Use JSON export/import to move data.
- No notifications, no barcode scanning, no multi-user sharing.
- Clearing browser site data erases stored parcels (export first).

## Status

Complete MVP. Tests recorded in `TEST_RESULTS.md`.
