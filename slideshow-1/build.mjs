import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
// FORMAT=3x4 or 4x5 lays the slides out on a wider canvas, 1920 tall, and saves them 1080 wide.
const FORMATS = { '9x16': 1080, '3x4': 1440, '4x5': 1536 };
const FORMAT = process.env.FORMAT ?? '9x16';
const CW = FORMATS[FORMAT];
const DIR = FORMAT === '9x16' ? '' : `${FORMAT}/`;
const OUT = new URL('.', import.meta.url).pathname;
const src = readFileSync(`${ROOT}data/dots.ts`, 'utf8');
const dots = JSON.parse(src.match(/DOTS = new Float32Array\((\[[^\]]*\])/)[1]);
const counties = JSON.parse(src.match(/DOT_COUNTIES = (\[[^\]]*\])/)[1]);
const fonts = `${ROOT}node_modules/@fontsource-variable`;

function map({ hi = null, dot = 'rgb(18 18 16 / .2)', hiColor = '#d4ff3a' } = {}) {
  const hiIdx = counties.indexOf(hi);
  let c = '';
  for (let i = 0; i < dots.length; i += 3) {
    const on = dots[i + 2] === hiIdx;
    c += `<circle cx="${dots[i]}" cy="${dots[i + 1]}" r="${on ? 4.4 : 3.4}" fill="${on ? hiColor : dot}"/>`;
  }
  return `<svg viewBox="0 0 1000 716" class="map">${c}</svg>`;
}

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212';
const EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+2020,U+20A0-20AB,U+20AD-20C0,U+2C60-2C7F,U+A720-A7FF';
const face = (fam, pkg, w) => ['latin', 'latin-ext'].map((sub) =>
  `@font-face{font-family:${fam};src:url(file://${fonts}/${pkg}/files/${pkg}-${sub}-wght-normal.woff2);font-weight:${w};unicode-range:${sub === 'latin' ? LATIN : EXT}}`).join('\n');
const faces = face('BS', 'big-shoulders-display', '100 900') + face('BG', 'bricolage-grotesque', '200 800') + face('JB', 'jetbrains-mono', '100 800');
const css = `
${faces}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${CW}px;height:1920px;overflow:hidden}
body{background:#f2efe7;color:#121210;font-family:BG,sans-serif;position:relative}
body.dark{background:#0c0c0b;color:#f1eee6}
.pad{position:absolute;inset:0;padding:250px 90px 280px;display:flex;flex-direction:column}
.logo{position:absolute;top:120px;left:90px;font-family:BS;font-weight:800;font-size:58px;letter-spacing:.5px}
.logo b{background:#d4ff3a;color:#0c0c0b;padding:0 6px;font-weight:800}
.n{position:absolute;top:132px;right:90px;font-family:JB;font-size:30px;letter-spacing:4px;opacity:.5}
h1{font-family:BS;font-weight:850;text-transform:uppercase;line-height:1.06;letter-spacing:-1px}
.hl{display:inline-block;background:#d4ff3a;color:#0c0c0b;line-height:.9;padding:.19em 14px .2em;margin:.02em 0 0 -14px;white-space:nowrap}
.dark .acc{color:#d4ff3a}
.dark .logo b{background:none;color:#d4ff3a;padding:0}
p{font-size:52px;line-height:1.25;font-weight:500}
.dim{opacity:.6}
${CW > 1080 ? ".map{width:100%;max-width:900px;display:block}" : ".map{width:100%}"}
.mono{font-family:JB;font-size:30px;letter-spacing:5px;text-transform:uppercase}
.card{background:#fbfaf6;border:2px solid rgb(18 18 16 / .14);padding:70px 60px}
.q{font-family:BG;font-weight:600;font-size:60px;line-height:1.18;margin:36px 0 60px}
.btn{height:150px;border:3px solid #121210;display:flex;align-items:center;padding:0 48px;font-family:BS;font-weight:800;font-size:68px;text-transform:uppercase;margin-top:28px}
.btn.on{background:#121210;color:#f1eee6}
.btn.on::after{content:'';margin-left:auto;width:44px;height:44px;background:#d4ff3a;border-radius:50%}
.bar{height:10px;background:rgb(18 18 16 / .1);margin-top:28px}
.bar i{display:block;height:100%;width:35%;background:#121210}
`;

const page = (body, cls = '') => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body class="${cls}">${body}</body></html>`;
const logo = (n) => `<div class="logo">partidul<b>.ai</b></div><div class="n">${n}/6</div>`;

const slides = [
  // 1. Hook
  page(`${logo(1)}<div class="pad" style="justify-content:center">
    <p class="dim" style="font-size:56px;margin-bottom:40px">Politicienii spun des:</p>
    <h1 style="font-size:230px">„Oamenii<br>vor…”</h1>
    <h1 style="font-size:150px;margin-top:110px"><span class="acc">Pe tine te-a<br>întrebat<br>cineva?</span></h1>
  </div>`, 'dark'),

  // 2. Question card
  page(`${logo(2)}<div class="pad" style="justify-content:center">
    <h1 style="font-size:150px;margin-bottom:80px">Uite o<br><span class="hl">întrebare.</span></h1>
    <div class="card">
      <div class="mono dim">Întrebarea 7 din 20</div>
      <div class="bar"><i></i></div>
      <div class="q">În ultimii 3 ani, ai rămas fără medicul la care mergeai pentru că a plecat din localitate sau din țară?</div>
      <div class="btn on">Da</div>
      <div class="btn">Nu</div>
    </div>
  </div>`),

  // 3. Format
  page(`${logo(3)}<div class="pad" style="justify-content:center">
    <h1 style="font-size:220px">20 de<br>întrebări</h1>
    <h1 style="font-size:220px;margin-top:0">despre<br><span class="hl">România.</span></h1>
    <p style="margin-top:110px">Câteva minute.<br>Anonim, fără cont.</p>
  </div>`),

  // 4. Map / county
  page(`${logo(4)}<div class="pad">
    <h1 style="font-size:120px">La final vezi<br>cum vezi tu<br>lucrurile.</h1>
    <div style="margin:70px -20px 60px">${map({ hi: 'RO113' })}</div>
    <h1 style="font-size:120px">Și cum le vede<br><span class="hl">județul tău.</span></h1>
    <p class="dim" style="margin-top:60px;font-size:46px">Diaspora primește aceleași întrebări.</p>
  </div>`),

  // 5. Not a party
  page(`${logo(5)}<div class="pad" style="justify-content:center">
    <h1 style="font-size:190px">Nu suntem<br>un partid<br>politic.</h1>
    <h1 style="font-size:190px;margin-top:60px"><span class="hl">Dar ne</span><br><span class="hl">pasă.</span></h1>
    <p style="margin-top:110px">Răspunsurile le vom publica liber, fără nimic după care să fii recunoscut.</p>
  </div>`),

  // 6. CTA
  page(`<div class="pad" style="justify-content:center">
    <div style="margin:0 60px 100px">${map({ dot: 'rgb(241 238 230 / .22)', hi: null })}</div>
    <h1 style="font-size:180px">Spune ce merge.<br><span class="acc">Și ce nu.</span></h1>
    <h1 style="font-size:150px;margin-top:110px;text-transform:none;letter-spacing:0">partidul<span class="acc">.ai</span></h1>
    <p class="dim" style="margin-top:30px;font-size:46px">Link în bio</p>
  </div>`, 'dark'),
];

const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
slides.forEach((html, i) => {
  const f = `${OUT}${DIR}slide-${i + 1}.html`;
  writeFileSync(f, html);
  execFileSync(chrome, ['--headless', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    `--force-device-scale-factor=${1080 / CW}`, `--window-size=${CW},1920`, '--virtual-time-budget=3000',
    `--screenshot=${OUT}${DIR}slide-${i + 1}.png`, `file://${f}`], { stdio: 'ignore' });
});
console.log('ok');
