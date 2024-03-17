import { createXYZ } from 'ol/tilegrid.js';
import { launch } from 'puppeteer';
import { LRUCache } from 'lru-cache';
import os from 'os';
import { existsSync, mkdirSync, rmSync } from 'fs';

const urlBase = `http://localhost:${process.env.PORT || 3000}`;

const loadedPages = new LRUCache({
  max: 16,
  dispose: async (style, page) => {
    try {
      await page.close();
    } catch (e) {
      console.error('error closing page', e);
    }
  },
});

/** @type {Promise<import("puppeteer").Browser>} */
let browserSingleton;

/**
 * @returns {Promise<import("puppeteer").Browser>}
 */
async function getBrowser() {
  if (browserSingleton) {
    return browserSingleton;
  }
  const userDir = `${os.tmpdir()}/puppeteer`;
  if (existsSync(userDir)) {
    rmSync(userDir, { recursive: true, force: true });
  }
  mkdirSync(userDir);
  browserSingleton = launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--user-data-dir=${userDir}`,
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
      '--incognito',
    ],
  });
  (await browserSingleton).on('disconnected', () => {
    loadedPages.clear();
    browserSingleton = undefined;
  });
  return browserSingleton;
}

/**
 * @param {string} style Style url.
 * @returns {Promise<import("puppeteer").Page>}
 */
function getPage(style) {
  let loadedPage = loadedPages.get(style);
  if (loadedPage) {
    return loadedPage;
  }
  loadedPage = new Promise(async (resolve, reject) => {
    try {
      const browser = await getBrowser();
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      page.on('error', (err) => {
        console.error('page crash', err);
        loadedPages.delete(style);
      });
      page.on('pageerror', (err) => {
        console.error('uncaught exception', err);
        loadedPages.delete(style);
      });
      page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
      await page.setViewport({ width: 1024, height: 1024 });

      await page.exposeFunction('mapError', (message) => {
        reject(new Error(message));
      });

      await page.exposeFunction('mapReady', () => resolve(page));

      const url = `${urlBase}/index.html?style=${style}`;
      await page.goto(url, {
        waitUntil: 'networkidle2',
      });
    } catch (e) {
      reject(e);
    }
  });
  loadedPages.set(style, loadedPage);
  return loadedPage;
}

const tilegrid = createXYZ({ tileSize: 512, maxZoom: 22 });

export async function generateTile(mimeType, style, tileCoord) {
  const page = await getPage(style);
  page.bringToFront();
  let result;
  try {
    const resolution = tilegrid.getResolution(tileCoord[0]);
    const center = tilegrid.getTileCoordCenter(tileCoord);
    await page.evaluate(
      (center, resolution) => requestMapImage(center, resolution),
      center,
      resolution,
    );
    result = await page.screenshot({
      encoding: 'binary',
      type: mimeType.split('/')[1],
      clip: { x: 256, y: 256, width: 512, height: 512 },
    });
  } finally {
    await page.evaluate(() => nextMapImage());
    return result;
  }
}
