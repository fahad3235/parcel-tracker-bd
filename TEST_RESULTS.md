# TEST RESULTS -- parcel-tracker-bd

Run date: 2026-10-17. Date override used by smoke tests: `?asof=2026-10-17`.
All results below are real runs, not estimates.

## Unit tests (node:test)

Command: `node --test tests/unit.test.js`

Result: **14 test blocks, 14 pass, 0 fail. 153 executed assertions**
(101 assert call sites; several run inside loops over transition pairs and
malformed-import cases).

Coverage highlights (all hand-verified by the test expectations):

- Transition legality: all 10 legal pairs allowed; all 23 illegal pairs
  rejected (incl. Booked -> Delivered, In Transit -> Delivered,
  Delivered -> Returned, terminal self-loops, unknown statuses).
- `nextStatuses('In Transit')` = [Out for Delivery, Returned, Cancelled];
  terminal statuses have no next statuses.
- `applyTransition` appends one history entry, leaves the original
  untouched, returns null for illegal transitions.
- Overdue (today = 2026-10-17): expected 2026-10-16 + In Transit /
  Booked / Out for Delivery = overdue; + Delivered / Returned / Cancelled
  = not overdue; expected today = not overdue; expected tomorrow =
  not overdue; blank expected date = not overdue.
- COD sums (mixed statuses, hand-computed): Booked 100000 + In Transit
  250050 + Out for Delivery 5000 = **355050 pending**; Delivered 75025 =
  **75025 collected**; Returned 99999 + Cancelled 12345 excluded from
  both; in-transit count 3 (Picked Up + In Transit + Out for Delivery);
  delivered count 1; empty list = all zeros.
- COD parser: "1500" -> 150000, "1500.5" -> 150050, "0.01" -> 1,
  "0.10" -> 10; rejects "-5", "12.345", "abc", "12.", ".5", "1,500".
- Money formatting: 150050 -> "1,500.50"; 5 -> "0.05";
  123456789 -> "1,234,567.89"; BN: 150050 -> Taka-sign + "1,500.50" in
  Bengali digits; `toBengaliDigits('2026-10-17')` -> Bengali-digit date.
- Date validation: 2026-02-29 rejected (not a leap year), 2024-02-29
  accepted, 2026-13-01 / 2026-10-32 / DD-MM-YYYY rejected.
- Validation: duplicate tracking ID rejected case-insensitively
  ("rx123" vs "RX123"); same ID allowed when editing the same parcel;
  bad courier / COD / date / missing tracking each produce their error.
- Filter/sort: "rahim" matches 2 parcels; Bengali query matches the
  Bengali item; courier filter, status filter, empty query work; sort
  orders verified: newest c,b,a; oldest a,b,c; expected b,a,c (blank
  expected date last); COD b,c,a.
- Import validation: valid round-trip accepted; **12 malformed cases**
  rejected (wrong app, wrong version, parcels not an array, bad status,
  fractional COD, negative COD, string COD, bad courier, duplicate
  tracking, bad date, history not starting at Booked, illegal history
  chain) + null / string / array top-level rejected + history-last !=
  status rejected.

## Smoke tests (headless Chromium, puppeteer-core)

Command: `node tests/smoke.mjs` (app loaded as
`file://.../index.html?asof=2026-10-17`)

Result: **56 checks, 56 pass, 0 fail.**

Hand-verified UI numbers (asof = 2026-10-17):

- Ships EMPTY: total 0, COD pending Taka 0.00, COD collected Taka 0.00,
  overdue 0.
- Add P1 (RX123, RedX, COD 1500, expected 2026-10-20): total 1,
  in-transit 0 (Booked does not count), pending Taka 1,500.00,
  collected Taka 0.00, overdue 0.
- Add P2 (ST999, Steadfast, COD 0 prepaid, expected 2026-10-16): total 2,
  overdue 1, pending still Taka 1,500.00, overdue list names ST999.
- Booked card shows Picked Up + Cancelled buttons and NO Delivered button.
- Advance P1 Booked -> Picked Up -> In Transit -> Out for Delivery ->
  Delivered: badge Delivered; dashboard delivered 1, collected
  Taka 1,500.00, pending Taka 0.00, in-transit 0.
- Detail view: history has exactly 5 entries (one per status).
- Search "ST999" -> 1 card; clear -> 2 cards. Courier Steadfast -> 1 card.
  Status chip Delivered -> 1 card; All -> 2 cards.
- BN toggle: collected shows Bengali digits; language persists across
  reload (still `bn` after reload); toggling back restores `en`.
- Export contains RX123 + ST999 + app id; typed-DELETE erase -> 0 parcels;
  import of the exported JSON restores 2 parcels with "Imported 2".
- Malformed import (`{"app":"wrong",...}`) -> "Import failed", count
  stays 2 (data intact).
- Duplicate tracking ID RX123 -> "already exists" error, still 2 cards.
- Edit P2 expected date to 2026-10-25 -> overdue 0.
- Delete P2 (confirm accepted) -> one fewer card.
- 390px viewport: `documentElement.scrollWidth <= 390` on dashboard,
  parcels, and data views.
- 0 console errors, 0 page errors, 0 network requests.

## Repairs

- 1 repair cycle (smoke): the language button was missing its
  `data-i18n="langBtn"` binding, so it stayed "Bangla" after switching
  to BN. Fixed in `index.html`; smoke re-run 56/56.
- 1 test-expectation fix (unit, not app code): the expected Bengali-digit
  rendering of "2026" was mistyped in the test; the app output was
  correct. Fixed the test.
- 1 data fix (not app code): a Bengali "60" in a BN error string used the
  wrong digit escapes; corrected in `js/app.js`.

## Static checks

- `grep -rP '[^\x00-\x7F]'` over all source files: zero matches
  (pure-ASCII sources; Bengali via `\uXXXX` escapes only).
- Total source size: ~89.8 KB across 8 files (fits ~2 push chunks).
- No secrets, no fabricated data, no network calls (verified: 0 requests
  in smoke run).
