import { writeFileSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
// FORMAT=3x4 or 4x5 lays the slides out on a wider canvas, 1920 tall, and saves them 1080 wide.
const FORMATS = { '9x16': 1080, '3x4': 1440, '4x5': 1536 };
// Space kept clear of text at the top and bottom (canvas px), so TikTok's and Instagram's overlays don't cover it.
const SAFE = { '9x16': [220, 460], '3x4': [220, 300], '4x5': [200, 280] };
const FORMAT = process.env.FORMAT ?? '9x16';
const CW = FORMATS[FORMAT];
const DIR = FORMAT === '9x16' ? '' : `${FORMAT}/`;
const OUT = new URL('.', import.meta.url).pathname;
const [TOP, BOTTOM] = SAFE[FORMAT];
const fonts = `${ROOT}node_modules/@fontsource-variable`;

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
.pad{position:absolute;inset:0;padding:${TOP + 130}px 160px ${BOTTOM}px 90px;display:flex;flex-direction:column;justify-content:safe center}
.logo{position:absolute;top:${TOP}px;left:90px;font-family:BS;font-weight:800;font-size:58px;letter-spacing:.5px}
.logo b{background:#d4ff3a;color:#0c0c0b;padding:0 6px;font-weight:800}
.dark .logo b{background:none;color:#d4ff3a;padding:0}
h1{font-family:BS;font-weight:850;text-transform:uppercase;line-height:1.14;letter-spacing:-1px}
.hl{display:inline-block;background:#d4ff3a;color:#0c0c0b;line-height:.9;padding:.19em 14px .2em;margin:.02em 0 0 -14px;white-space:nowrap}
.dark .acc{color:#d4ff3a}
p{font-size:50px;line-height:1.28;font-weight:500}
.dim{opacity:.6}
.mono{font-family:JB;font-size:34px;letter-spacing:5px;text-transform:uppercase}
.steps{list-style:none}
.steps li{display:flex;align-items:baseline;gap:36px;padding:34px 0;border-top:3px solid #121210}
.steps li:last-child{border-bottom:3px solid #121210}
.steps .mono{width:60px;flex:none}
.steps h1{font-size:104px}
.list{list-style:none;margin-top:60px}
.list li{font-size:54px;font-weight:600;padding:16px 0;border-top:2px solid rgb(18 18 16 / .2)}
.row{display:flex;align-items:baseline;gap:40px;margin-top:10px}
.row p{opacity:.7;white-space:nowrap}
.arrow{display:block;width:60px;height:90px;margin:10px 0 10px 40px}
.grid{display:grid;grid-template-columns:auto 1fr;column-gap:40px;align-items:baseline;margin-top:30px}
.grid p{white-space:nowrap}
.src{font-family:JB;font-size:34px;letter-spacing:1px;opacity:.7;margin-top:70px}
`;

// Shrinks a slide's text until it fits between the safe margins.
const fit = `<script>document.fonts.ready.then(() => {
  const pad = document.querySelector('.pad'), box = pad.firstElementChild, cs = getComputedStyle(pad);
  const room = pad.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const right = innerWidth - parseFloat(cs.paddingRight);
  const over = () => box.getBoundingClientRect().height > room ||
    texts().some((t) => { const r = document.createRange(); r.selectNodeContents(t); return r.getBoundingClientRect().right > right; });
  const texts = () => { const w = document.createTreeWalker(box, NodeFilter.SHOW_TEXT), out = []; while (w.nextNode()) out.push(w.currentNode); return out; };
  for (let z = 1; z > 0.4 && over(); z -= 0.02) box.style.zoom = z;
});</script>`;
const page = (body, cls = '') => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body class="${cls}"><div class="logo">partidul<b>.ai</b></div>${body.replace(/^<div class="pad">([\s\S]*)<\/div>$/, '<div class="pad"><div>$1</div></div>')}${fit}</body></html>`;

const down = `<svg class="arrow" viewBox="0 0 60 90"><path d="M30 0v78M6 54l24 26 24-26" fill="none" stroke="currentColor" stroke-width="9"/></svg>`;

const slides = [
  // 1. Cover
  page(`<div class="pad">
    <h1 style="font-size:190px">Ce spun cifrele despre <span class="acc">România?</span></h1>
    <p style="margin-top:70px">Ce merge, ce nu și unde sunt diferențele.</p>
    <div class="mono acc" style="margin-top:90px;font-size:44px;letter-spacing:2px;text-transform:none">partidul.ai/wiki</div>
  </div>`, 'dark'),

  // 2. Education
  page(`<div class="pad">
    <div class="mono dim" style="margin-bottom:40px">Educație</div>
    <h1 style="font-size:300px"><span class="hl">15,5%</span></h1>
    <p style="margin-top:60px">dintre tinerii de 18–24 de ani au cel mult 8 clase și nu mai merg la școală sau la vreun curs.</p>
    <p style="margin-top:40px"><b>Cel mai mult din UE. Media&nbsp;UE:&nbsp;9,1%.</b></p>
    <div class="src">Sursa: Eurostat, 2025</div>
  </div>`),

  // 3. Poverty
  page(`<div class="pad">
    <div class="mono dim" style="margin-bottom:40px">Social</div>
    <p>Câți oameni din România sunt amenințați de sărăcie:</p>
    <div class="row"><h1 style="font-size:230px">34,4%</h1><p>2021</p></div>
    ${down}
    <div class="row"><h1 style="font-size:230px"><span class="hl">27,4%</span></h1><p>2025</p></div>
    <div class="src">Sursa: Eurostat, 2021 și 2025</div>
  </div>`),

  // 4. Regions
  page(`<div class="pad">
    <div class="mono dim" style="margin-bottom:40px">Regiuni</div>
    <h1 style="font-size:130px">Diferențe mari în aceeași țară</h1>
    <p style="margin-top:50px">Cât produce în medie un locuitor, ținând cont de prețuri, 2024. <b>Media&nbsp;UE&nbsp;=&nbsp;100%.</b></p>
    <div class="grid">
      <h1 style="font-size:230px"><span class="hl">188%</span></h1><p>București-Ilfov</p>
      <h1 style="font-size:230px">48%</h1><p>Nord-Est</p>
    </div>
    <div class="src">Sursa: Eurostat, 2024</div>
  </div>`),

  // 5. Sources
  page(`<div class="pad">
    <h1 style="font-size:180px">Fiecare cifră are <span class="acc">sursă</span></h1>
    <p style="margin-top:80px;font-size:62px;font-weight:600">Vezi datele și explicațiile din 11 domenii pe <span class="acc">partidul.ai/wiki</span>. Link în bio.</p>
    <p class="dim" style="margin-top:70px;font-size:42px">Din această cercetare pornesc întrebările chestionarului.</p>
  </div>`, 'dark'),
];

const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
slides.forEach((html, i) => {
  const f = `${OUT}${DIR}slide-${i + 1}.html`;
  writeFileSync(f, html);
  execFileSync(chrome, ['--headless', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    `--force-device-scale-factor=${1080 / CW}`, `--window-size=${CW},1920`, '--virtual-time-budget=3000',
    `--screenshot=${OUT}${DIR}slide-${i + 1}.png`, `file://${f}`], { stdio: 'ignore' });
  unlinkSync(f);
});
console.log('ok');
