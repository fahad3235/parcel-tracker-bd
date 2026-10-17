/* parcel-tracker-bd smoke tests -- headless Chromium via puppeteer-core.
   Run: node tests/smoke.mjs
   (puppeteer-core is resolved from this build's node_modules if present,
   else from the shared job-application-tracker-bd install.) */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let puppeteerMod;
try {
  puppeteerMod = require('puppeteer-core');
} catch (e) {
  puppeteerMod = require('/home/hatch/workspace/muse-project-factory/builds/job-application-tracker-bd/node_modules/puppeteer-core');
}
const puppeteer = puppeteerMod.default || puppeteerMod;

const APP = 'file:///home/hatch/workspace/muse-project-factory/builds/parcel-tracker-bd/index.html?asof=2026-10-17';

let pass = 0, fail = 0;
function eq(name, actual, expected) {
  if (actual === expected) { pass++; }
  else { fail++; console.log('FAIL', name, '| actual:', JSON.stringify(actual), '| expected:', JSON.stringify(expected)); }
}
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL', name); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: '/opt/meta-chromium/chrome',
  headless: 'new',
  args: ['--no-sandbox', '--no-proxy-server', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
page.on('dialog', d => d.accept());
const consoleErrors = [], pageErrors = [];
let netRequests = 0;
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(String(e)));
page.on('request', r => { if (!r.url().startsWith('data:') && !r.url().startsWith('file:')) netRequests++; });

await page.goto(APP, { waitUntil: 'load' });
await page.evaluate(() => window.localStorage.clear());
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.__PT_READY === true, { timeout: 8000 });

// 1. render + asof + ships EMPTY
eq('asof honored', await page.evaluate(() => window.__PT_state().asof), '2026-10-17');
eq('h1 title', await page.$eval('#h-title', el => el.textContent.trim()), 'Parcel Tracker BD');
eq('lang button shows Bangla label', await page.$eval('#langBtn', el => el.textContent.trim()), 'Bangla');
eq('dash total 0', await page.$eval('#vTotal', el => el.textContent.trim()), '0');
eq('dash COD pending 0', await page.$eval('#vCodPending', el => el.textContent.trim()), '\u09F30.00');
eq('dash COD collected 0', await page.$eval('#vCodCollected', el => el.textContent.trim()), '\u09F30.00');
eq('dash overdue 0', await page.$eval('#vOverdue', el => el.textContent.trim()), '0');
ok('footer disclaimer', (await page.$eval('footer', el => el.textContent)).includes('Not connected to any courier'));

async function addParcel(tr, courier, sender, item, cod, expected) {
  await page.click('#tabParcels');
  await sleep(150);
  await page.$eval('#f-tracking', (el, v) => el.value = v, tr);
  await page.select('#f-courier', courier);
  await page.$eval('#f-sender', (el, v) => el.value = v, sender);
  await page.$eval('#f-item', (el, v) => el.value = v, item);
  await page.$eval('#f-cod', (el, v) => el.value = v, cod);
  await page.$eval('#f-expected', (el, v) => el.value = v, expected);
  const before = await page.$$eval('.parcel-card', els => els.length);
  await page.click('#btnSave');
  await page.waitForFunction(n => document.querySelectorAll('.parcel-card').length === n, { timeout: 5000 }, before + 1);
  await sleep(150);
}

async function dashVals() {
  await page.click('#tabDash');
  await sleep(200);
  return {
    total: await page.$eval('#vTotal', el => el.textContent.trim()),
    inTransit: await page.$eval('#vInTransit', el => el.textContent.trim()),
    delivered: await page.$eval('#vDelivered', el => el.textContent.trim()),
    pending: await page.$eval('#vCodPending', el => el.textContent.trim()),
    collected: await page.$eval('#vCodCollected', el => el.textContent.trim()),
    overdue: await page.$eval('#vOverdue', el => el.textContent.trim()),
  };
}

async function cardText(tr) {
  return await page.evaluate(t => {
    const cards = [...document.querySelectorAll('.parcel-card')];
    const card = cards.find(c => c.textContent.includes(t));
    return card ? card.textContent : '';
  }, tr);
}

async function clickCardButton(tr, act, to) {
  await page.evaluate((t, a, toVal) => {
    const cards = [...document.querySelectorAll('.parcel-card')];
    const card = cards.find(c => c.textContent.includes(t));
    if (!card) throw new Error('card not found ' + t);
    let sel = 'button[data-act="' + a + '"]';
    if (toVal) sel = 'button[data-act="transition"][data-to="' + toVal + '"]';
    const btn = card.querySelector(sel);
    if (!btn) throw new Error('button not found ' + a + ' ' + (toVal || ''));
    btn.click();
  }, tr, act, to || null);
  await sleep(250);
}

// 2. add P1 (COD 1500, expected future) -> hand-verified dashboard
await addParcel('RX123', 'RedX', 'Shop A', 'Saree', '1500', '2026-10-20');
let d = await dashVals();
eq('total 1 after P1', d.total, '1');
eq('inTransit 0 (Booked not in transit)', d.inTransit, '0');
eq('pending 1500.00 after P1', d.pending, '\u09F31,500.00');
eq('collected 0 after P1', d.collected, '\u09F30.00');
eq('overdue 0 after P1', d.overdue, '0');

// 3. add P2 (COD 0 prepaid, expected yesterday -> overdue)
await addParcel('ST999', 'Steadfast', 'Shop B', 'Book', '0', '2026-10-16');
d = await dashVals();
eq('total 2 after P2', d.total, '2');
eq('overdue 1 (P2 expected yesterday, Booked)', d.overdue, '1');
eq('pending still 1500.00 (P2 prepaid)', d.pending, '\u09F31,500.00');
ok('overdue list names ST999', (await page.$eval('#overdueList', el => el.textContent)).includes('ST999'));

// 4. illegal transition button absent for Booked parcel
await page.click('#tabParcels');
await sleep(200);
const p1text = await cardText('RX123');
ok('Booked card shows Picked Up', p1text.includes('Picked Up'));
ok('Booked card shows Cancelled', p1text.includes('Cancelled'));
ok('Booked card shows NO Delivered button', !p1text.includes('Delivered'));

// 5. status advance Booked -> ... -> Delivered
for (const to of ['Picked Up', 'In Transit', 'Out for Delivery', 'Delivered']) {
  await clickCardButton('RX123', 'transition', to);
}
const p1after = await cardText('RX123');
ok('P1 badge Delivered after advance', p1after.includes('Delivered'));
d = await dashVals();
eq('delivered 1 after P1 delivered', d.delivered, '1');
eq('collected 1500.00 after delivery', d.collected, '\u09F31,500.00');
eq('pending 0.00 after delivery', d.pending, '\u09F30.00');
eq('inTransit 0 after delivery', d.inTransit, '0');

// 6. detail view history: 5 entries
await page.click('#tabParcels');
await sleep(150);
await clickCardButton('RX123', 'view');
await sleep(200);
eq('history entries = 5', await page.$$eval('#detailPanel .history li', els => els.length), 5);
ok('history shows Booked', (await page.$eval('#detailPanel .history', el => el.textContent)).includes('Booked'));

// 7. search narrows
await page.$eval('#qSearch', el => el.value = 'ST999');
await page.evaluate(() => document.getElementById('qSearch').dispatchEvent(new Event('input', { bubbles: true })));
await sleep(200);
eq('search ST999 -> 1 card', await page.$$eval('.parcel-card', els => els.length), 1);
await page.click('#btnClearSearch');
await sleep(200);
eq('clear search -> 2 cards', await page.$$eval('.parcel-card', els => els.length), 2);

// 8. courier filter + status chips
await page.select('#fCourierFilter', 'Steadfast');
await sleep(200);
eq('courier Steadfast -> 1 card', await page.$$eval('.parcel-card', els => els.length), 1);
await page.select('#fCourierFilter', '');
await sleep(200);
await page.evaluate(() => document.querySelector('#statusChips button[data-status="Delivered"]').click());
await sleep(200);
eq('status Delivered chip -> 1 card', await page.$$eval('.parcel-card', els => els.length), 1);
await page.evaluate(() => document.querySelector('#statusChips button[data-status=""]').click());
await sleep(200);
eq('status All chip -> 2 cards', await page.$$eval('.parcel-card', els => els.length), 2);

// 9. BN toggle renders Bengali digits + persists across reload
await page.click('#langBtn');
await sleep(200);
eq('BN: lang button shows English', await page.$eval('#langBtn', el => el.textContent.trim()), 'English');
eq('BN: collected shows Bengali digits', await page.evaluate(() => window.__PT_state().lang), 'bn');
await page.click('#tabDash');
await sleep(150);
ok('BN: collected has Bengali digit 1', (await page.$eval('#vCodCollected', el => el.textContent)).includes('\u09E7'));
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.__PT_READY === true, { timeout: 8000 });
eq('BN persists after reload', await page.evaluate(() => window.__PT_state().lang), 'bn');
eq('BN persists: button still English', await page.$eval('#langBtn', el => el.textContent.trim()), 'English');
await page.click('#langBtn');
await sleep(200);
eq('back to EN', await page.evaluate(() => window.__PT_state().lang), 'en');

// 10. export -> wipe -> import round-trip
await page.click('#tabData');
await sleep(150);
await page.click('#btnExport');
await sleep(200);
const exported = await page.$eval('#exportOut', el => el.value);
ok('export contains RX123', exported.includes('RX123'));
ok('export contains ST999', exported.includes('ST999'));
ok('export app id', exported.includes('parcel-tracker-bd'));
await page.$eval('#eraseInput', el => el.value = 'DELETE');
await page.evaluate(() => document.getElementById('eraseInput').dispatchEvent(new Event('input', { bubbles: true })));
await sleep(100);
await page.click('#btnErase');
await sleep(200);
eq('after erase total 0', await page.evaluate(() => window.__PT_state().count), 0);
await page.$eval('#importText', (el, v) => el.value = v, exported);
await page.click('#btnImport');
await sleep(300);
eq('import restores 2 parcels', await page.evaluate(() => window.__PT_state().count), 2);
ok('import msg', (await page.$eval('#dataMsg', el => el.textContent)).includes('Imported 2'));

// 11. malformed import rejected with data intact
await page.$eval('#importText', el => el.value = '{"app":"wrong","version":1,"parcels":[]}');
await page.click('#btnImport');
await sleep(200);
ok('malformed import msg', (await page.$eval('#dataMsg', el => el.textContent)).includes('Import failed'));
eq('data intact after malformed import', await page.evaluate(() => window.__PT_state().count), 2);

// 12. duplicate tracking-ID rejected
await page.click('#tabParcels');
await sleep(150);
await page.$eval('#f-tracking', el => el.value = 'RX123');
await page.select('#f-courier', 'RedX');
await page.$eval('#f-cod', el => el.value = '0');
await page.click('#btnSave');
await sleep(200);
ok('duplicate error shown', (await page.$eval('#formErrs', el => el.textContent)).includes('already exists'));
eq('still 2 cards after duplicate attempt', await page.$$eval('.parcel-card', els => els.length), 2);
await page.$eval('#f-tracking', el => el.value = '');
await page.evaluate(() => { document.getElementById('formErrs').style.display = 'none'; });

// 13. edit P2 expected date -> overdue clears
await clickCardButton('ST999', 'edit');
await sleep(200);
await page.$eval('#f-expected', (el, v) => el.value = v, '2026-10-25');
await page.click('#btnSave');
await sleep(300);
d = await dashVals();
eq('overdue 0 after edit to future date', d.overdue, '0');

// 14. delete with confirm
await page.click('#tabParcels');
await sleep(150);
const beforeDel = await page.$$eval('.parcel-card', els => els.length);
await clickCardButton('ST999', 'delete');
await sleep(300);
eq('delete removes one card', await page.$$eval('.parcel-card', els => els.length), beforeDel - 1);

// 15. 390px no horizontal overflow on all views
await page.setViewport({ width: 390, height: 844 });
for (const tab of ['dash', 'parcels', 'data']) {
  await page.evaluate(t => document.querySelector('[data-tab="' + t + '"]').click(), tab);
  await sleep(250);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok('390px no overflow on ' + tab + ' (scrollWidth=' + sw + ')', sw <= 390);
}

// 16. zero errors, zero network
eq('console errors 0', consoleErrors.length, 0);
eq('page errors 0', pageErrors.length, 0);
eq('network requests 0', netRequests, 0);

console.log('SMOKE pass=' + pass + ' fail=' + fail);
await browser.close();
if (fail > 0) process.exit(1);
