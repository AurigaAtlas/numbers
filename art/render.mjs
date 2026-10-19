// Rasterizes the vector art in this folder into public/assets.
// Usage: node art/render.mjs   (needs Playwright; set PLAYWRIGHT_MODULE to its path if it is not installed locally)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { appIcon, countStar, gameFind, shopItemArt } from "./items.mjs";
import { roomArt } from "./rooms.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(root, "public", "assets");
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");

// Where each accessory sits on the 320×400 avatar canvas, and which part of the
// 512×512 artwork (x0, y0, x1, y1) should fill that spot.
const avatarPlacement = {
  "cloud-cushion": { art: [40, 90, 470, 440], box: [176, 270, 316, 362], align: "bottom" },
  "flower-bouquet": { art: [90, 80, 430, 480], box: [40, 196, 132, 362], align: "bottom" },
  "gem-necklace": { art: [90, 90, 422, 456], box: [128, 108, 192, 196], align: "top" },
  "magic-book": { art: [56, 30, 456, 480], box: [24, 236, 152, 360], align: "bottom" },
  "moon-lantern": { art: [100, 30, 412, 500], box: [214, 178, 286, 352], align: "bottom" },
  "music-mic": { art: [70, 70, 440, 480], box: [206, 200, 296, 362], align: "bottom" },
  "ribbon-umbrella": { art: [50, 66, 462, 492], box: [160, 140, 320, 334], align: "bottom" },
  "sparkle-shield": { art: [86, 50, 426, 462], box: [24, 196, 150, 362], align: "bottom" }
};

function placeOnAvatar(svgText, { art, box, align }) {
  const [ax0, ay0, ax1, ay1] = art;
  const [bx0, by0, bx1, by1] = box;
  const scale = Math.min((bx1 - bx0) / (ax1 - ax0), (by1 - by0) / (ay1 - ay0));
  const width = (ax1 - ax0) * scale;
  const height = (ay1 - ay0) * scale;
  const x = bx0 + ((bx1 - bx0) - width) / 2;
  const y = align === "top" ? by0 : by1 - height;
  // Drop the ground shadow: held items should not cast one on the floor.
  const inner = svgText
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "")
    .replace(/<ellipse[^>]*fill="#5a3a5e"[^>]*\/>/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 400" width="320" height="400">
    <svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${ax0} ${ay0} ${ax1 - ax0} ${ay1 - ay0}" overflow="visible">${inner}</svg>
  </svg>`;
}

const browser = await chromium.launch();
async function renderAt(svgText, outPath, scale) {
  const context = await browser.newContext({ deviceScaleFactor: scale });
  const scaledPage = await context.newPage();
  const size = svgText.match(/viewBox="0 0 (\d+) (\d+)"/);
  await scaledPage.setViewportSize({ width: Number(size[1]), height: Number(size[2]) });
  await scaledPage.setContent(`<html><body style="margin:0;background:transparent">${svgText}</body></html>`);
  const png = await (await scaledPage.$("svg")).screenshot({ omitBackground: true });
  mkdirSync(dirname(outPath), { recursive: true });
  if (outPath.endsWith(".png")) {
    writeFileSync(outPath, png);
    await context.close();
    return;
  }
  // Chromium encodes WebP itself, so no image library is needed.
  const webp = await scaledPage.evaluate(async (src) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);
    return canvas.toDataURL("image/webp", 0.86).split(",")[1];
  }, `data:image/png;base64,${png.toString("base64")}`);
  writeFileSync(outPath, Buffer.from(webp, "base64"));
  await context.close();
}

const only = process.argv.slice(2);
const want = (name) => only.length === 0 || only.includes(name);

for (const [id, draw] of Object.entries(shopItemArt)) {
  if (!want(id)) continue;
  const svgText = draw();
  writeFileSync(join(root, "art", "svg", `${id}.svg`), svgText);
  await renderAt(svgText, join(assets, "custom-shop-png", `${id}.webp`), 1.5);
  await renderAt(placeOnAvatar(svgText, avatarPlacement[id]), join(assets, "custom-shop-avatar", `${id}.webp`), 2);
  console.log("item", id);
}

for (const [id, draw] of Object.entries(roomArt)) {
  if (!want(id)) continue;
  const svgText = draw();
  writeFileSync(join(root, "art", "svg", `${id}.svg`), svgText);
  await renderAt(svgText, join(assets, "custom-shop-png", `${id}.webp`), 1);
  console.log("room", id);
}

if (want("object-star")) {
  writeFileSync(join(root, "art", "svg", "object-star.svg"), countStar());
  await renderAt(countStar(), join(assets, "object-star.webp"), 1);
}
if (want("game-find")) {
  writeFileSync(join(root, "art", "svg", "game-find.svg"), gameFind());
  await renderAt(gameFind(), join(assets, "game-find.webp"), 2);
}

if (want("app-icon")) {
  writeFileSync(join(root, "art", "svg", "app-icon.svg"), appIcon());
  // Home-screen icons stay PNG: iOS does not accept WebP there.
  await renderAt(appIcon(), join(root, "public", "icon-512.png"), 1);
  await renderAt(appIcon(), join(root, "public", "icon-192.png"), 0.375);
  await renderAt(appIcon(), join(root, "public", "apple-touch-icon.png"), 0.3515625);
}

await browser.close();
