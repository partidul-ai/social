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

const slides = [
  // 1. Title
  page(`<div class="pad">
    <h1 style="font-size:190px">Manifestul partidul.ai, <span class="acc">pe scurt</span></h1>
  </div>`, 'dark'),

  // 2. Vox
  page(`<div class="pad">
    <h1 style="font-size:200px">Construim <span class="hl">Vox</span></h1>
    <p style="margin-top:80px">O aplicație în care îți spui părerea oricând și vezi ce cred ceilalți.</p>
  </div>`),

  // 3. How it works
  page(`<div class="pad">
    <div class="mono dim" style="margin-bottom:50px">Cum va funcționa</div>
    <ol class="steps">
      <li><span class="mono">01</span><h1>Îți spui părerea</h1></li>
      <li><span class="mono">02</span><h1>Vox face calculele</h1></li>
      <li><span class="mono">03</span><h1>Se scrie un document</h1></li>
      <li><span class="mono">04</span><h1><span class="hl">Oamenii îl votează</span></h1></li>
    </ol>
  </div>`),

  // 4. Where documents go
  page(`<div class="pad">
    <h1 style="font-size:140px">Documentul poate fi trimis la</h1>
    <h1 style="font-size:140px;margin-top:10px"><span class="hl">primărie</span><br><span class="hl">consiliul județean</span><br><span class="hl">Parlament</span></h1>
    <p style="margin-top:80px">Prin consultare publică sau inițiativă legislativă cetățenească, căi care există deja în lege.</p>
  </div>`),

  // 5. Verifiable
  page(`<div class="pad">
    <h1 style="font-size:150px">Totul va fi <span class="hl">public</span></h1>
    <p style="margin-top:80px">Regulile, întrebările și calculele vor sta într-un registru public. Oricine va putea reface calculele, iar orice modificare se va vedea.</p>
  </div>`),

  // 6. Not a party
  page(`<div class="pad">
    <h1 style="font-size:180px">Nu suntem un partid <span class="hl">politic</span></h1>
    <p style="margin-top:80px">Nu candidăm și nu susținem niciun partid sau candidat. Plătim totul din banii noștri.</p>
  </div>`),

  // 7. CTA
  page(`<div class="pad">
    <p style="font-size:60px">Azi avem un chestionar anonim: 20 de întrebări, câteva minute.</p>
    <h1 style="font-size:170px;margin-top:70px;text-transform:none;letter-spacing:0">partidul<span class="acc">.ai</span></h1>
    <p class="dim" style="margin-top:50px">Manifestul întreg:<br>partidul.ai/manifest</p>
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
