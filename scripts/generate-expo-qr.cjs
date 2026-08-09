const fs = require("node:fs/promises");
const path = require("node:path");
const QRCode = require("../node_modules/.pnpm/qrcode-terminal@0.11.0/node_modules/qrcode-terminal/vendor/QRCode");
const QRErrorCorrectLevel = require("../node_modules/.pnpm/qrcode-terminal@0.11.0/node_modules/qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel");
const sharp = require("../node_modules/.pnpm/sharp@0.34.5/node_modules/sharp");

const [, , value, output = "expo-qr"] = process.argv;

if (!value) {
  throw new Error("Usage: node scripts/generate-expo-qr.cjs <value> [output]");
}

const qr = new QRCode(-1, QRErrorCorrectLevel.M);
qr.addData(value);
qr.make();

const quietZone = 4;
const moduleSize = 14;
const moduleCount = qr.getModuleCount();
const size = (moduleCount + quietZone * 2) * moduleSize;
const rectangles = [];

for (let row = 0; row < moduleCount; row += 1) {
  for (let column = 0; column < moduleCount; column += 1) {
    if (!qr.isDark(row, column)) continue;
    rectangles.push(
      `<rect x="${(column + quietZone) * moduleSize}" y="${(row + quietZone) * moduleSize}" width="${moduleSize}" height="${moduleSize}"/>`,
    );
  }
}

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
  '<rect width="100%" height="100%" fill="#fff"/>',
  `<g fill="#171717">${rectangles.join("")}</g>`,
  "</svg>",
].join("");

const outputPath = path.resolve(output);

async function writeQr() {
  await fs.writeFile(`${outputPath}.svg`, svg);
  await sharp(Buffer.from(svg)).png().toFile(`${outputPath}.png`);
  console.log(`${outputPath}.png`);
}

writeQr().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
