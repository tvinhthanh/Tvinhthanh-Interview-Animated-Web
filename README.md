# Hemidi – Junior Animated Web Developer Entry Exam

This is my submission for the Junior Animated Web Developer test at Hemidi. I rebuilt the "Sark" landing page from the Figma file in Next.js. I also added a 3D robot, driven by Three.js and GSAP ScrollTrigger, that follows the visitor down the page.

- Live demo: https://tvinhthanh-interview.vercel.app/
- Source: https://github.com/tvinhthanh/Tvinhthanh-Interview-Animated-Web
- Stack: Next.js 16 (App Router, static), Three.js 0.180, GSAP 3.13

## Running it locally

```bash
npm install
npm run dev              # http://localhost:3000
npm run build && npm start
```

If you deploy somewhere other than Vercel, set `NEXT_PUBLIC_SITE_URL` to the real domain so the canonical URL, Open Graph tags and sitemap point to the right place. On Vercel you don't need it: the code picks up the production domain automatically.

## The 3D model

The model comes from Sketchfab: [Friendly Sci-Fi Robot with Animations](https://sketchfab.com/3d-models/friendly-sci-fi-robot-with-animations-b83ac12ac3f14119a0988532d3613dac). The author and license are listed on the original page.

The downloaded file was 5.4 MB, and the PNG texture alone took up 3.8 MB of that. That's far too heavy for a landing page, so I compressed it with glTF-Transform:

```bash
npx @gltf-transform/cli optimize robot.glb public/models/friendly-robot.glb \
  --compress meshopt --texture-compress webp --texture-size 1024
```

That brought it down to 574 KB, about 89% smaller. The texture is now a 1024px WebP of 133 KB, which still looks sharp since the robot is only around 500px tall on screen. The mesh uses meshopt compression. `MeshoptDecoder` ships with three, so no extra wasm file is needed. All three animation clips survived intact.

## How the robot moves

Everything lives in [`lib/robotScene.js`](lib/robotScene.js).

One thing up front: the brief asks for an "Idle" clip in the hero, but this model **doesn't have one**. It only has `Look_Wave`, `Free_Fall` and `Sitting`. So in the hero I loop `Look_Wave` and add a gentle bob in code so it looks like it's breathing. The robot's body turns toward the mouse cursor, with smoothing so it never snaps.

My first version moved the whole canvas with CSS using fixed pixel offsets. It fell apart as soon as the window size changed, because the robot drifted out of place. So I rebuilt it:

- The canvas covers the whole viewport.
- The page has a few "anchor" elements (`data-robot-anchor`) placed exactly where the robot should stand.
- Every frame, the code reads the anchor's position on screen and converts it to 3D coordinates. Then GSAP `quickTo` eases the robot's position, scale and rotation toward it.

This keeps the robot lined up with the layout on any screen size, including tablets and phones.

| Section | Where the robot is | Clip |
|---|---|---|
| Hero | Inside the arch on the right, turned toward the headline | `Look_Wave` |
| Features | Next to the heading | `Free_Fall` |
| About | Sitting inside the video arch | `Sitting` |
| Team | In Leslie Alexander's circle, waving like a team member | `Look_Wave` |

Between sections the robot "falls" from one anchor to the next using the `Free_Fall` clip. ScrollTrigger switches the clips, with a 0.45s crossfade between them. If the visitor has `prefers-reduced-motion` turned on, the robot just stands still.

## Performance

The brief asks for a PageSpeed Desktop score above 90. Results from PageSpeed Insights on the live site (Sep 23, 2026):

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | 100 | 100 | 100 | 100 |
| Mobile | 98 | 100 | 100 | 100 |

The robot runs at a steady 60 FPS while animating (measured with Chrome's Frame Rendering Stats).

What got it there:

- **Three.js is not part of the initial JavaScript.** It only loads once the page has rendered, the heading font is in, and the robot is actually on screen. On desktop the robot is visible right away, so it loads immediately. On phones the robot sits below the fold, so it only loads once the visitor starts scrolling.
- **No GPU means a static image.** This one caught me out on real PageSpeed: desktop scored 69. Google's test machines have no GPU, so WebGL was rendering on the CPU and every frame became a long task. Now, before loading Three.js, the page tries to create a WebGL context with `failIfMajorPerformanceCaveat`. If only software rendering is available, it shows an 18 KB image of the robot instead of the 3D version. Visitors with a GPU still get the 3D robot as normal.
- **Rendering stops when the robot is off screen**, and the canvas resolution is capped at 1.5x.
- **Fonts are self-hosted with `next/font`** (Inter and Source Serif Pro), with size-matched fallback fonts, so the page doesn't jump when the fonts swap in (CLS = 0).
- **The hero headline shows up immediately with no fade-in**, since it's the LCP element.
- **Images go through `next/image`**, and animations only touch `transform` and `opacity`.
- **The SEO basics are covered:** metadata, an Open Graph image, canonical URL, sitemap, robots.txt and JSON-LD.

While the model loads, a small pulsing green dot marks the spot where the robot will appear. When loading finishes, the robot fades in.

The brand logos in the "trusted by" strip are the official SVGs from Wikimedia Commons, used only because they appear in the design. They're trademarks of their respective owners.

## Project structure

```
app/            layout, main page, CSS, fonts, sitemap/robots/OG image
components/     Experience.jsx: canvas, lazy-loading the scene, mobile menu
lib/            robotScene.js: Three.js scene, anchors, GSAP
public/models/  friendly-robot.glb (compressed) and the fallback robot image
```

## With more time

- The newsletter form in the footer only shows a thank-you message; it isn't connected to a backend yet.
- The Blog, Pages and Login links point to sections on this page, since the design only covers a single page.
- A real Idle clip would need to be made in Blender, or I'd switch to a model that already includes one.
