// إخراج صفحات دليل إرث: صورة PNG وملف PDF لكل صفحة
// الاستعمال: node render-pages.js <مجلد الصفحات> <مجلد الإخراج> [اسم الصفحة ...]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [pagesDir, outDir, ...only] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const names = only.length ? only : fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).map(f => f.slice(0, -5));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
  for (const name of names) {
    await page.goto('file://' + path.resolve(pagesDir, name + '.html'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState('networkidle');
    const root = await page.$('body > div');
    const box = await root.boundingBox();
    const over = await root.evaluate(el => [el.scrollWidth > el.clientWidth + 1, el.scrollHeight > el.clientHeight + 1]);
    await page.screenshot({ path: path.join(outDir, name + '.png'), clip: { x: 0, y: 0, width: 1600, height: 1200 } });
    await page.pdf({ path: path.join(outDir, name + '.pdf'), width: '1600px', height: '1200px', printBackground: true, pageRanges: '1' });
    console.log(name, `${Math.round(box.width)}x${Math.round(box.height)}`, over[0] || over[1] ? 'OVERFLOW' : 'ok');
  }
  await browser.close();
})();
