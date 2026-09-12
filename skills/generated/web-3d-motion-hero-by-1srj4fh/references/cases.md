# Case evidence

This is an unofficial synthesis of a recurring method found in 24 published Cases attributed to MotionSites. It is not an official Skill from that creator.

## Operating rule

Choose one evidence card below as the anchor before drafting. Inspect its finished media, then state which traits will be preserved, replaced, and avoided. A title match alone is not evidence.

### E1 · 3D Jack Portfolio

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/3d-jack-portfolio) · [finished media](https://media.goodcase.ai/cases/49f8aeaa5fab.mp4) · [poster](https://media.goodcase.ai/cases/5f968f89c3fe.webp) · [original source](https://motionsites.ai/?prompt=3d-jack-portfolio-hero)
- Summary: 3D 创作者 Jack 的作品集落地页，React + TypeScript + Framer Motion，#0C0C0C 暗底。
- Prompt excerpt:

> Build a 3D Creator portfolio landing page for "Jack" using React, TypeScript, Tailwind CSS, Framer Motion, and Lucide React. The page has a dark theme (#0C0C0C background) with the font Kanit (Google Fonts, weights 300-900). The page title is "Jack -- 3D Creator".
>
> GLOBAL STYLES
> Background: #0C0C0C on html, body, #root, and the main wrapper
> Font family: 'Kanit', sans-serif
> Global reset: box-sizing border-box, margin 0, padding 0
> CSS class .hero-heading: gradient text using background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%) with -webkit-background-clip: text and -webkit-text-fill-color: transparent
> Main wrapper has overflowX: 'clip'
> SECTION ORDER
> HeroSection
> MarqueeSection
> AboutSection
> ServicesSection
> ProjectsSection
> 1. HERO SECTION
> Full viewport height (h-screen), flex column layout with overflowX: clip.
>
> Navbar: Horizontal nav bar with 4 links -- "About", "Price", "Projects", "Contact" -- evenly spaced with justify-between. Text color #D7E2EA, font-medium, uppercase, tracking-wider. Sizes: text-sm md:text-lg lg:text-[1.4rem]. Padding: px-6 md:px-10 pt-6 md:pt-8. Hover: opacity 70% with 200ms transition.
>
> Hero Heading: Massive h1 with text "Hi, i'm jack" (lowercase "i", curly apostrophe via &apos;). Uses the .hero-heading gradient text class. Font-black, uppercase, tracking-tight, leading-none, whitespace-nowrap, w-full. Font sizes: text-[14vw] sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]. Margin top: mt-6 sm:mt-4 md:-mt-5. Wrapped in overflow-hidden container.
>
> Bottom bar: Flexbox justify-between items-end with pb-7 sm:pb-8 md:pb-10:
>
> Left: paragraph text "a 3…

### E2 · Agent Wave

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/agent-wave) · [finished media](https://media.goodcase.ai/cases/ae8afbd1c466.mp4) · [poster](https://media.goodcase.ai/cases/19e5c9e121d4.webp) · [original source](https://motionsites.ai/?prompt=agent-wave)
- Summary: 单文件 HTML 复刻 Vesper.ai 单屏落地页，内联 CSS 加一小段 IIFE 处理菜单和动画降级，零框架零依赖，适合学怎么把整页规格压进一个文件。
- Prompt excerpt:

> Recreate this exact single-viewport landing page for **Vesper.ai**. Document title: `Vesper.ai — Operational AI Infrastructure`. `lang="en"`. One HTML file with inline CSS and a small IIFE for the menu + animation fallback. Pure black `#000000`. No extra sections, cards, forms, pricing tables, or footer beyond the three stats. Do **not** add a video, WebGL, Three.js, or Lottie. Do **not** invent a CloudFront URL.
>
> Force black immediately so the page can never flash white:
>
> - First CSS rule: `html, body { background: #000000 !important; color: #ffffff; }`
> - Body attribute: `style="background:#000;color:#fff"`
> - Then again: `html, body { background: #000000; background: var(--bg, #000000); color: #ffffff; color: var(--text, #ffffff); }`
>
> ---
>
> ### Fonts (exact)
>
> Self-hosted WOFF2s sitting next to `index.html`:
>
> ```css
> @font-face {
>   font-family: "Inter";
>   font-style: normal;
>   font-weight: 100 900;
>   font-display: swap;
>   src: url("inter.woff2") format("woff2");
> }
> @font-face {
>   font-family: "Instrument Serif";
>   font-style: italic;
>   font-weight: 400;
>   font-display: swap;
>   src: url("instrument-serif-italic.woff2") format("woff2");
> }
> ```
>
> Stacks:
>
> - UI / logo / nav / buttons / badge / lede / stats: `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
> - **Only** the H1 words `AI agents`: `"Instrument Serif", "Times New Roman", Times, serif`
>
> If those files are missing, load this exact Google Fonts CSS (Inter variable roman + Instrument Serif italic only):
>
> ```
> https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900&family=In…

### E3 · AI Workflow Hero

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/ai-workflow-hero) · [finished media](https://media.goodcase.ai/cases/9e51fe5b57ba.webp) · [original source](https://motionsites.ai/?prompt=ai-workflow)
- Summary: AI 工作流产品 hero，React 18 + Tailwind 3.4，明确不用动画库，图标清单点名到具体组件。
- Prompt excerpt:

> ### Stack
>
> - **Vite** + **React 18** + **TypeScript**
> - **Tailwind CSS 3.4**
> - **lucide-react** for icons (`LogIn`, `UserPlus`, `Play`, `Sparkles`, `Menu`, `X`)
> - No Framer Motion -- all animations are CSS `transition-*` classes
>
> ---
>
> ### Fonts (loaded in `index.html`)
>
> ```html
> <link rel="preconnect" href="https://fonts.googleapis.com" />
> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
> <link href="https://db.onlinewebfonts.com/c/6e47ef470dd19698c911332a9b4d1cf4?family=Neue+Haas+Grotesk+Text+Pro" rel="stylesheet" />
> <link href="https://db.onlinewebfonts.com/c/dec0d9b4e22ca588dc20e1e2e09a59b5?family=Neue+Haas+Grotesk+Display+Pro+55+Roman" rel="stylesheet" />
> ```
>
> Body/root font stack (in `index.css`):
>
> ```css
> html, body, #root {
>   height: 100%;
>   margin: 0;
>   font-family: 'Neue Haas Grotesk Display Pro 55 Roman', 'Neue Haas Grotesk Text Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif;
>   -webkit-font-smoothing: antialiased;
> }
> ```
>
> ---
>
> ### Video URL (CloudFront)
>
> ```
> https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4
> ```
>
> ---
>
> ### Color Palette
>
> | Token | Hex |
> |-------|-----|
> | Dark green (text, buttons) | `#1f2a1d` |
> | Medium dark green | `#2d3a2a` |
> | Button hover | `#2a3827` |
> | Body text green | `#4b5b47` |
> | Heading primary | `#336443` |
> | Heading accent | `#85AB8B` |
> | Bottom-left text | `#3d5638` |
> | Bottom-left button bg | `#3d5638`, hover `#2d422…

### E4 · Animated Cards

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/animated-cards) · [finished media](https://media.goodcase.ai/cases/9cacdc3c42fa.webp) · [original source](https://motionsites.ai/?prompt=animated-cards)
- Summary: 银行卡 3D 圆柱轮播，React hooks 驱动的高性能交互组件，这批里交互复杂度最高的一条。
- Prompt excerpt:

> Create a high-performance, interactive 3D horizontal cylinder carousel showing premium animated bank cards.
> Core Features & Interactions:
> Use React (useState, useEffect, useRef), Tailwind CSS v4, and standard requestAnimationFrame for a smooth 60fps render loop. No external animation libraries needed.
> The scene should behave like a continuous circular scroll/carousel, updating a continuous progress variable.
> Add interactive 3D parallax tilt to the cards that smoothly responds to mouse cursor movement (mousemove), using inertia damping to lag slightly behind the cursor.
> The cards should have real volumetric 3D thickness (achieved by stacking multiple div layers close together, simulating 3D depth).
> The carousel math should push cards to the sides (using smoothstep interpolation) and hide them gracefully using perspective formulas as they move completely off-screen.
> Each card must have a front and back face. The front face includes an autoplaying video background, a silver metallic chip (SVG), an embedded JWT logo top-right, and intersecting circles bottom-right. The back face should blur the same video background, have a dark magnetic stripe across the top, and feature the cardholder name, number, and CVV in JetBrains Mono.
> Visual Styling:
> Use a pure black background (#000000).
> The application relies exclusively on the interactive 3D card layout (no text layers over the background).
> Make sure the scene's wrapper uses CSS perspective: 1350px; and standard transformStyle: preserve-3d.
> Please use the exact code below for src/App.tsx and src/index.css to build this exactly as re…

### E5 · Aurora Onboard

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/aurora-onboard) · [finished media](https://media.goodcase.ai/cases/2f00c494a458.png) · [original source](https://motionsites.ai/?prompt=aurora-onboard)
- Summary: 双栏注册界面 Aurora Sign Up，React + Tailwind v4 + motion/react，表单页也认真做动效。
- Prompt excerpt:

> Please build a modern, two-column registration interface called "Aurora Sign Up". Use React, Tailwind CSS (v4), `motion/react` (for animations), and `lucide-react` (for icons). The app should be contained entirely in `App.tsx` and `index.css`.
>
> ### 1. Global Setup & CSS (`index.css`)
> - Import the "Inter" font from Google Fonts (weights 300, 400, 500, 600, 700).
> - Extend the Tailwind theme with `--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;` and a custom color: `--color-brand-gray: #1A1A1A`.
> - Apply base styles to the `body`: `@apply font-sans bg-black text-white antialiased;`.
>
> ### 2. Main Layout (`App.tsx` container)
> - The `<main>` element should have: `flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500`.
> - On `lg` breakpoints: `lg:h-screen lg:overflow-hidden lg:p-4`.
> - Split this container into a Left Column (Hero) and a Right Column (Form).
>
> ### 3. Left Column (Hero & Background Video)
> - Width on large screens should be exactly `w-[52%]`. It should be hidden on mobile/tablet and only visible `lg:flex`.
> - Styles: `relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full`.
> - **Background Video**: Add an absolutely positioned `<video>` tag (`inset-0`, `w-full`, `h-full`, `object-cover`). It must have `autoPlay`, `muted`, `loop`, and `playsInline`.
> - **CRITICAL**: The `<source>` MUST be exactly `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4` (`type="video/mp4"`).
> - **CRITICAL**: Do NOT add any dar…

### E6 · Cognitra Feature

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/cognitra-feature) · [finished media](https://media.goodcase.ai/cases/f509b931f907.webp) · [original source](https://motionsites.ai/?prompt=cognitra-feature)
- Summary: 压在固定视频背景上的全透明区块，滚动时视频不动内容动，视差思路的干净实现。
- Prompt excerpt:

> ---
>
> **Prompt:**
>
> Create a full-viewport section (100vh) that sits over a fixed background video. The section has no background color of its own -- it is fully transparent so the fixed video behind it shows through.
>
> **Background video (fixed, behind everything):**
> A `<video>` element fixed to the viewport (`position: fixed; top: 0; left: 0; width: 100%; height: 100vh; object-fit: cover; z-index: 0`), using this source:
> ```
> https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_135830_bb6491d1-9b66-4aec-9722-13b4dfe3fb46.mp4
> ```
> It should `autoPlay`, be `muted`, `loop`, and `playsInline`.
>
> **Section layout:**
> - `position: relative; z-index: 1`
> - `display: flex; flex-direction: column; justify-content: center` (centers content vertically)
> - `height: 100vh`
> - Padding: `70px 32px 32px 32px`
>
> **Content block** (inside the section):
> - A wrapper `div` with `display: flex; flex-direction: column; align-items: flex-start; max-width: 720px`
> - **Heading (`<h2>`):**
>   - Text: `"WE BUILD END-TO-END AI AUTOMATION SYSTEMS."`
>   - Each word is wrapped in an individual `<span>` element, displayed using `display: flex; flex-wrap: wrap; gap: 0.25em`
>   - Each word animates in with a staggered fade-up animation: starts at `opacity: 0, y: 32px`, animates to `opacity: 1, y: 0` using Framer Motion `whileInView` with `viewport: { once: true, amount: 0.2 }`
>   - Stagger: first word at `delay: 0.15`, each subsequent word adds `0.08s` (so word 2 = 0.23, word 3 = 0.31, etc.)
>   - Animation easing: `[0.22, 1, 0.36, 1]`, duration: `0.7s`
>   - Typography: `font-size: clamp(26px, 3v…

### E7 · Contact Cybernetic

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/contact-cybernetic) · [finished media](https://media.goodcase.ai/cases/c7cfd48d97c3.webp) · [original source](https://motionsites.ai/?prompt=contact-cybernetic)
- Summary: 带交互动效的赛博风联系区块，React + Tailwind + Framer Motion，架构与样式说明分层列出，prompt 组织方式值得抄。
- Prompt excerpt:

> Build a modern, interactive hero section using React, Tailwind CSS, and Framer Motion (motion/react). Ensure you follow these precise architecture and styling instructions:
> 1. Fonts & Global Animations
> Import the Inter font from Google Fonts.
> In your CSS setup, configure Tailwind to use it by default (--font-sans: 'Inter', ...).
> Create a keyframe animation in CSS named blink for the typewriter cursor:
> code
> CSS
> @keyframes blink {
>   0%, 100% { opacity: 1; }
>   50% { opacity: 0; }
> }
> .animate-blink { animation: blink 1s step-end infinite; }
> 2. General Page Structure
> Wrap the entire application in a container div with the following classes: relative bg-white text-neutral-900 font-sans selection:bg-[#EAECE9] selection:text-[#1C2E1E] antialiased overflow-x-hidden flex flex-col lg:block lg:min-h-screen.
> 3. Background Video Component (with Native Scrubbing)
> Container element: Add a div containing the background video with classes: order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-neutral-50 lg:bg-transparent.
> Video element: Use <video> with muted, playsInline, preload="auto".
> Video Source URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4
> Classes: w-full h-full object-cover object-right lg:object-right-bottom.
> Scrubbing/Playback Logic via useEffect hooks:
> Desktop Mouse Scrubbing Hook: Listen to the window mousemove event. If window.innerWidth < 1024, ignore (disable scrubbing). Store the…

### E8 · Cybersecurity Hero

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/cybersecurity-hero) · [finished media](https://media.goodcase.ai/cases/8de7f3672f86.webp) · [original source](https://motionsites.ai/?prompt=cybersecurity-hero)
- Summary: 安全产品 Xero 的单页 hero 精确复刻题，React + TypeScript，Inter 字体，规格写到不留发挥空间。
- Prompt excerpt:

> Build a **single-page React + TypeScript (Vite)** landing hero for a product called **"Xero"** that recreates the following section exactly. Use the **Inter** Google Font (weights 300, 400, 500, 600, 700, 800). Do not use Tailwind utility classes for the hero — write plain CSS in a global stylesheet. No purple/indigo branding outside the specified pink-magenta gradient arc.
>
> ## Layout & Structure
>
> Render three top-level blocks centered on a black page (`#0a0a0f`), each constrained to `max-width: 1600px`, in this vertical order:
>
> 1. **`<nav>`** — sticky-style top bar (not actually sticky, just at top)
> 2. **`<section class="hero-card">`** — the rounded dark hero card with the animated icon pipeline
> 3. **`<div class="brands">`** — a row of 5 monochrome brand logos
>
> The body uses `display: flex; flex-direction: column; align-items: center; padding: 14px;` and `font-family: 'Inter', sans-serif;`.
>
> ### CSS Variables (on `:root`)
> ```
> --bg: #0a0a0f;
> --surface: #111118;
> --text: #f0f0f5;
> --text-muted: #8888a8;
> --accent: #c8a0e0;
> --accent-pink: #b04090;
> --border: rgba(255, 255, 255, 0.08);
> ```
>
> ## NAVBAR
>
> - Grid layout: `grid-template-columns: 1fr auto 1fr; padding: 12px 24px; margin-bottom: 14px;`
> - **Left**: `<span class="nav-logo">Xero</span>` — `font-size: 1.05rem; font-weight: 700; letter-spacing: -0.01em;`
> - **Center**: `<ul class="nav-links">` with three `<a>` items: **Method**, **Pricing**, **Docs**. Color `--text-muted`, `font-size: 0.85rem`, gap 32px, hover transitions to `--text` over 0.2s.
> - **Right**: `<div class="nav-actions">` containing two pill buttons:
>   - `.btn-logi…

## Evidence index

| Case | Creator | GoodCase evidence | Finished media | Original source | Card |
| --- | --- | --- | --- | --- | --- |
| 3D Jack Portfolio | MotionSites | [GoodCase](https://goodcase.ai/cases/3d-jack-portfolio) | [Media](https://media.goodcase.ai/cases/49f8aeaa5fab.mp4) | [Original](https://motionsites.ai/?prompt=3d-jack-portfolio-hero) | E1 |
| Agent Wave | MotionSites | [GoodCase](https://goodcase.ai/cases/agent-wave) | [Media](https://media.goodcase.ai/cases/ae8afbd1c466.mp4) | [Original](https://motionsites.ai/?prompt=agent-wave) | E2 |
| AI Workflow Hero | MotionSites | [GoodCase](https://goodcase.ai/cases/ai-workflow-hero) | [Media](https://media.goodcase.ai/cases/9e51fe5b57ba.webp) | [Original](https://motionsites.ai/?prompt=ai-workflow) | E3 |
| Animated Cards | MotionSites | [GoodCase](https://goodcase.ai/cases/animated-cards) | [Media](https://media.goodcase.ai/cases/9cacdc3c42fa.webp) | [Original](https://motionsites.ai/?prompt=animated-cards) | E4 |
| Aurora Onboard | MotionSites | [GoodCase](https://goodcase.ai/cases/aurora-onboard) | [Media](https://media.goodcase.ai/cases/2f00c494a458.png) | [Original](https://motionsites.ai/?prompt=aurora-onboard) | E5 |
| Cognitra Feature | MotionSites | [GoodCase](https://goodcase.ai/cases/cognitra-feature) | [Media](https://media.goodcase.ai/cases/f509b931f907.webp) | [Original](https://motionsites.ai/?prompt=cognitra-feature) | E6 |
| Contact Cybernetic | MotionSites | [GoodCase](https://goodcase.ai/cases/contact-cybernetic) | [Media](https://media.goodcase.ai/cases/c7cfd48d97c3.webp) | [Original](https://motionsites.ai/?prompt=contact-cybernetic) | E7 |
| Cybersecurity Hero | MotionSites | [GoodCase](https://goodcase.ai/cases/cybersecurity-hero) | [Media](https://media.goodcase.ai/cases/8de7f3672f86.webp) | [Original](https://motionsites.ai/?prompt=cybersecurity-hero) | E8 |
| Data Signal | MotionSites | [GoodCase](https://goodcase.ai/cases/data-signal) | [Media](https://media.goodcase.ai/cases/e2ed1bdd60a0.mp4) | [Original](https://motionsites.ai/?prompt=data-signal) | E— |
| Digitwist AI Builder | MotionSites | [GoodCase](https://goodcase.ai/cases/digitwist-ai-builder) | [Media](https://media.goodcase.ai/cases/7ab2104629a9.gif) | [Original](https://motionsites.ai/?prompt=digitwist-hero) | E— |
| Dot Hero | MotionSites | [GoodCase](https://goodcase.ai/cases/dot) | [Media](https://media.goodcase.ai/cases/acbd46556fad.gif) | [Original](https://motionsites.ai/?prompt=dot-hero) | E— |
| Fun 404 Page | MotionSites | [GoodCase](https://goodcase.ai/cases/fun-404-page) | [Media](https://media.goodcase.ai/cases/b6bd9e2c72d6.mp4) | [Original](https://motionsites.ai/?prompt=fun-404-page) | E— |
| HAUL! | MotionSites | [GoodCase](https://goodcase.ai/cases/haul) | [Media](https://media.goodcase.ai/cases/10b4615bc280.png) | [Original](https://motionsites.ai/?prompt=haul-footer) | E— |
| IntelligentX | MotionSites | [GoodCase](https://goodcase.ai/cases/intelligentx) | [Media](https://media.goodcase.ai/cases/f389ceba9f4a.webp) | [Original](https://motionsites.ai/?prompt=intelligentx) | E— |
| Modern Agency | MotionSites | [GoodCase](https://goodcase.ai/cases/modern-agency) | [Media](https://media.goodcase.ai/cases/4782ee3ed985.webp) | [Original](https://motionsites.ai/?prompt=modern-agency) | E— |
| Network Hero | MotionSites | [GoodCase](https://goodcase.ai/cases/network-hero) | [Media](https://media.goodcase.ai/cases/9bdbee439d08.webp) | [Original](https://motionsites.ai/?prompt=network-hero) | E— |
| Nike Hover | MotionSites | [GoodCase](https://goodcase.ai/cases/nike-hover) | [Media](https://media.goodcase.ai/cases/fe47363224eb.webp) | [Original](https://motionsites.ai/?prompt=nike-hover) | E— |
| Portfolio Cosmic | MotionSites | [GoodCase](https://goodcase.ai/cases/portfolio-cosmic) | [Media](https://media.goodcase.ai/cases/cabdb2cf1961.gif) | [Original](https://motionsites.ai/?prompt=portfolio-cosmic-hero) | E— |
| Prosthetics Hero | MotionSites | [GoodCase](https://goodcase.ai/cases/prosthetics-hero) | [Media](https://media.goodcase.ai/cases/9a33f27b799a.webp) | [Original](https://motionsites.ai/?prompt=prosthetics-hero) | E— |
| Radial Diagram | MotionSites | [GoodCase](https://goodcase.ai/cases/radial-diagram) | [Media](https://media.goodcase.ai/cases/538468b3c1c6.webp) | [Original](https://motionsites.ai/?prompt=radial-diagram) | E— |

## Derivation boundary

- Inclusion means the published Case matched the method pattern; it does not prove the creator used this exact synthesized workflow.
- Popularity is not part of the Skill threshold.
- Treat GoodCase summaries as editorial evidence and the linked original source as primary evidence.
