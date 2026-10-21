# Social

Slideshows for partidul.ai's TikTok and Instagram posts. Each folder holds one post: the slides as PNG, the script that draws them and, where there is one, the post's caption.

```bash
npm install
node slideshow-2/build.mjs              # 1080×1920
FORMAT=4x5 node slideshow-2/build.mjs   # 1080×1350, in slideshow-2/4x5/
```

The scripts render HTML with headless Google Chrome; set `CHROME` to its path if it is not in the default macOS location.

`data/dots.ts` is the dotted map of Romania from the website. Boundaries © EuroGeographics (Eurostat GISCO, NUTS 2024).
