import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

// Render the public UI without credentials or writes to the live backend.
const server = await createServer({server: {middlewareMode: true, hmr: false, ws: false}, appType: 'custom'});
try {
  const {default: Home, ThemeCollection} = await server.ssrLoadModule('/src/Home.tsx');
  const {WorldCover, default: Experience} = await server.ssrLoadModule('/src/Experience.tsx');
  const {sampleEvent, sampleGuest} = await server.ssrLoadModule('/src/demo.ts');
  let checks = 0;
  for (const lang of ['bn', 'en']) {
    const props = {lang, t: (bn, en) => lang === 'bn' ? bn : en, go() {}, start() {}};
    const html = renderToStaticMarkup(createElement(Home, props));
    assert.ok(html.includes(lang === 'bn' ? 'নিমন্ত্রণে থাকুক' : 'An invitation.'));
    assert.equal((html.match(/<details>/g) || []).length, 4);
    assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
    assert.ok(html.includes('aria-live="polite"'));
    assert.ok(html.includes('href="#collections"'));
    const themes = renderToStaticMarkup(createElement(ThemeCollection, props));
    for (const theme of ['neel', 'bon', 'alta', 'noor']) {
      assert.ok(themes.includes(`theme-${theme}`));
      const cover = renderToStaticMarkup(createElement(WorldCover, {event: {...sampleEvent(lang), theme}, guest: sampleGuest(lang).name}));
      assert.ok(cover.includes(`lang="${lang}"`));
      assert.ok(cover.includes(sampleGuest(lang).name.replaceAll('&', '&amp;')));
      checks++;
    }
    // Exercise the full demo route, including translated names and the RSVP form.
    globalThis.location = {search: '?theme=bon'};
    const demo = renderToStaticMarkup(createElement(Experience, {...props, token: 'demo', setToast() {}}));
    assert.ok(demo.includes('experience theme-bon'));
    assert.ok(demo.includes(lang === 'bn' ? 'সেনামালঞ্চ' : 'Senamaloncha'));
    assert.ok(demo.includes(lang === 'bn' ? 'জনাব করিম' : 'Mr. Karim'));
    assert.ok(demo.includes('name="response"'));
    assert.equal(sampleEvent(lang).language, lang);
    checks++;
  }
  assert.equal(sampleEvent('bn').host_names, 'আরিব & মেহরিন');
  assert.equal(sampleEvent('en').host_names, 'Arib & Mehrin');
  console.log(`PASS: ${checks} language/theme renders, both homepages, four FAQs, preview controls and demo RSVP markup.`);
} finally {
  await server.close();
}
