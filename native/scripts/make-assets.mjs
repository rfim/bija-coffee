// Renders the source images @capacitor/assets needs from the Bija mark, then generates every icon and splash size.
// Usage: node scripts/make-assets.mjs   (writes native/assets/*, android/app/src/main/res/*, ios/App/App/Assets.xcassets/*)
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const mark = (colour, stroke = 5) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 106 106"><g fill="none" stroke="${colour}" stroke-width="${stroke}"><circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/></g></svg>`;
const onSquare = async (size, bg, colour, markShare) => {
  const m = Math.round(size * markShare);
  const logo = await sharp(Buffer.from(mark(colour))).resize(m, m).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } }).composite([{ input: logo, gravity: 'center' }]).png();
};
mkdirSync('assets', { recursive: true });
// App icon: white mark on black, as on the website and PWA icons
await (await onSquare(1024, '#0b0b0b', '#ffffff', 0.56)).toFile('assets/icon-only.png');
// Android adaptive icon: foreground mark inside the 66% safe zone, solid black background
await (await onSquare(1024, { r: 0, g: 0, b: 0, alpha: 0 }, '#ffffff', 0.4)).toFile('assets/icon-foreground.png');
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#0b0b0b' } }).png().toFile('assets/icon-background.png');
// Splash: black mark on white (light theme), and the reverse for dark mode
await (await onSquare(2732, '#ffffff', '#0b0b0b', 0.16)).toFile('assets/splash.png');
await (await onSquare(2732, '#0b0b0b', '#ffffff', 0.16)).toFile('assets/splash-dark.png');
execSync('npx capacitor-assets generate --android --ios --iconBackgroundColor "#0b0b0b" --iconBackgroundColorDark "#0b0b0b" --splashBackgroundColor "#ffffff" --splashBackgroundColorDark "#0b0b0b"', { stdio: 'inherit' });
