import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:4173/example/index.html', { waitUntil: 'networkidle' });

const before = await page.evaluate(() => ({
  hasSelect: !!document.querySelector('mb-select'),
  portalsBefore: document.querySelectorAll('[data-mb-portal]').length,
  shadowHasRoot: !!document.querySelector('mb-select')?.shadowRoot,
  shadowSnippet: (document.querySelector('mb-select')?.shadowRoot?.innerHTML ?? '').slice(0, 300),
}));

await page.click('mb-select');
await page.waitForTimeout(100);

const after = await page.evaluate(() => {
  const portals = Array.from(document.querySelectorAll('[data-mb-portal]'));
  const first = portals[0] ?? null;
  const overlay = first?.querySelector('.mb-select-overlay');
  const list = first?.querySelector('.mb-select-list');
  const items = first ? first.querySelectorAll('.mb-select-item').length : 0;
  const hostHtml = first?.innerHTML ?? '';
  const style = overlay ? getComputedStyle(overlay) : null;
  return {
    portalsAfter: portals.length,
    hasOverlay: !!overlay,
    hasList: !!list,
    items,
    overlayDisplay: style?.display ?? null,
    overlayVisibility: style?.visibility ?? null,
    overlayOpacity: style?.opacity ?? null,
    overlayRect: overlay ? overlay.getBoundingClientRect().toJSON() : null,
    hostSnippet: hostHtml.slice(0, 300),
  };
});

const afterInternalClick = await page.evaluate(() => {
  const select = document.querySelector('mb-select');
  const trigger = select?.shadowRoot?.querySelector('.mb-select-trigger');
  trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

  const portals = Array.from(document.querySelectorAll('[data-mb-portal]'));
  const first = portals[0] ?? null;
  return {
    portalsAfterInternalClick: portals.length,
    hasOverlayAfterInternalClick: !!first?.querySelector('.mb-select-overlay'),
    itemsAfterInternalClick: first ? first.querySelectorAll('.mb-select-item').length : 0,
  };
});

await page.reload({ waitUntil: 'networkidle' });
await page.evaluate(() => {
  const logs = [];
  const select = document.querySelector('mb-select');
  const push = (name, target) => {
    logs.push({
      name,
      target: target && target.nodeType === 1 ? target.tagName.toLowerCase() : String(target),
      portalCount: document.querySelectorAll('[data-mb-portal]').length,
      ts: performance.now(),
    });
  };

  if (select) {
    ['mousedown', 'click', 'focusin', 'focusout'].forEach(type => {
      select.addEventListener(type, event => push(`host:${type}`, event.target), true);
      select.addEventListener(type, event => push(`hostb:${type}`, event.target));
    });
  }

  ['mousedown', 'click'].forEach(type => {
    document.addEventListener(type, event => {
      const target = event.target;
      if (target && target instanceof Node && select?.contains(target)) {
        push(`doc:${type}`, target);
      }
    }, true);
  });

  window.__mbSelectLogs = logs;
});
await page.click('mb-select .mb-select-trigger');
await page.waitForTimeout(100);
const afterPlaywrightTriggerClick = await page.evaluate(() => {
  const portals = Array.from(document.querySelectorAll('[data-mb-portal]'));
  const first = portals[0] ?? null;
  return {
    portalsAfterTriggerClick: portals.length,
    hasOverlayAfterTriggerClick: !!first?.querySelector('.mb-select-overlay'),
    itemsAfterTriggerClick: first ? first.querySelectorAll('.mb-select-item').length : 0,
    eventLogs: window.__mbSelectLogs ?? [],
  };
});

const afterHostDispatch = await page.evaluate(() => {
  const select = document.querySelector('mb-select');
  select?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
  const portals = Array.from(document.querySelectorAll('[data-mb-portal]'));
  const first = portals[0] ?? null;
  return {
    portalsAfterHostDispatch: portals.length,
    hasOverlayAfterHostDispatch: !!first?.querySelector('.mb-select-overlay'),
    itemsAfterHostDispatch: first ? first.querySelectorAll('.mb-select-item').length : 0,
  };
});

console.log(JSON.stringify({ before, after, afterInternalClick, afterHostDispatch, afterPlaywrightTriggerClick }, null, 2));
await browser.close();
