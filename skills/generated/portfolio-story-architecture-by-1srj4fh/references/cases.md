# Case evidence

This is an unofficial synthesis of a recurring method found in 11 published Cases attributed to MotionSites. It is not an official Skill from that creator.

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

### E2 · AI Designer Portfolio

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/ai-designer-portfolio) · [finished media](https://media.goodcase.ai/cases/1095b425fdb4.gif) · [poster](https://media.goodcase.ai/cases/52130085ccf9.png) · [original source](https://motionsites.ai/?prompt=vortex-studio-hero)
- Summary: 白底设计工作室单页，React + TypeScript + Tailwind 配 lucide-react 图标，看点在双字体排版体系怎么撑起极简白底的高级感。
- Prompt excerpt:

> Create a single-page landing page for a creative design studio called "Viktor Oddy" using React, TypeScript, Vite, and Tailwind CSS. Use lucide-react for icons. The page has a white background throughout and uses two custom fonts: "PP Neue Montreal" (body text, loaded from Webflow CDN) and "PP Mondwest" (serif accent font, loaded from a local /PPMondwest-Regular.woff2 file). The body default font is PP Neue Montreal with system fallbacks.
>
> The page consists of these sections in order:
>
> 1. HERO SECTION (centered, narrow column max-w-[440px], px-6, pt-12 md:pt-16)
>
> Logo text: "Viktor Oddy" in PP Mondwest serif font, text-[32px] md:text-[40px] lg:text-[44px], font-semibold, color #051A24, tracking-tight, mb-4. Fades in with staggered animation (delay 0.1s).
> Tagline: "The creative studio of Viktor Oddy" in monospace font (font-mono), text-xs md:text-sm, color #051A24, mb-2. Animation delay 0.2s.
> Main Heading: Two lines: "Build the next wave," and "the bold way." where "next wave" and "bold way." are in PP Mondwest serif. Text is text-[32px] md:text-[40px] lg:text-[44px], leading-[1.1], color #0D212C, tracking-tight, whitespace-nowrap. Animation delay 0.3s.
> Description: Three paragraphs in a flex-col gap-6 container, text-sm md:text-base, color #051A24, leading-relaxed, mt-5 md:mt-6. Animation delay 0.4s.
> Paragraph 1: "I spent seven years at Apple crafting products used by over a billion people. I founded Vortex Studio to bring that same level of thinking to innovators shaping what comes next."
> Paragraph 2: "The studio is deliberately small. I guide the creative vision on every…

### E3 · Bold Studio

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/bold-studio) · [finished media](https://media.goodcase.ai/cases/7f31efa5103a.webp) · [original source](https://motionsites.ai/?prompt=bold-studio)
- Summary: 创意机构 VANGUARD 的全屏 hero，React + Tailwind + Vite，单屏加循环视频背景。
- Prompt excerpt:

> Build a fullscreen hero landing page for a creative agency called "VANGUARD" using React, Tailwind CSS, and Vite. The page should be a single viewport-height section with a looping background video and all content overlaid on top.
>
> **Background video:**
> Use this exact CloudFront URL as a fullscreen `<video>` element with `autoPlay`, `muted`, `loop`, and `playsInline` attributes, set to `object-cover` to fill the entire viewport:
> ```
> https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_154941_df1a96e1-a06f-450c-bd02-d863414cc1a0.mp4
> ```
>
> **Fonts (loaded in index.html):**
> 1. "FSP DEMO - PODIUM Sharp 4.11" from `https://db.onlinewebfonts.com/c/8b75d9dcff6a48c35a46656192adf019?family=FSP+DEMO+-+PODIUM+Sharp+4.11` -- used for the brand name and main heading. Create a `.font-podium` utility class for it and register it in tailwind.config.js as `fontFamily.podium`.
> 2. "Inter" from Google Fonts (weights 400, 500, 600, 700) -- used for body text, nav links, stats, and CTAs. Register it in tailwind.config.js as `fontFamily.inter`.
>
> **Icons:** Use `lucide-react` for all icons: `ArrowUpRight`, `Award`, `Crown`, and `X`.
>
> **Navbar:**
> - Horizontal bar at the top with responsive padding (`px-6 sm:px-10 lg:px-16`, `py-5 lg:py-7`).
> - Left: brand name "VANGUARD" in `font-podium`, white, bold, uppercase, `text-2xl sm:text-3xl`, `tracking-wider`.
> - Center (hidden below `md`): four nav links -- "Projects", "Studio", "Offerings", "Inquire" -- in `font-inter`, `text-sm`, `text-white/80`, `tracking-widest`, uppercase, with `hover:text-white` transition.
> - Right (hidden…

### E4 · Creative Studio

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/creative-studio) · [finished media](https://media.goodcase.ai/cases/165720a4ee9a.webp) · [original source](https://motionsites.ai/?prompt=creative-studio)
- Summary: 全屏 hero，React + Tailwind + Framer Motion + Lucide，Inter 字体，规格逐项精确。
- Prompt excerpt:

> Build a full-screen hero section using React, Tailwind CSS, Framer Motion, and Lucide React icons. Use the Inter font. The page is fully mobile-responsive. Here are the exact specifications:
>
> ---
>
> **BACKGROUND:**
> - A full-screen autoplaying, looping, muted video covering the entire viewport as a background.
> - Video URL: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_222138_3e3205be-3364-417b-a64a-bfe087acbec4.mp4`
> - The video is positioned absolute, inset-0, with `object-cover` to fill the viewport.
>
> ---
>
> **COLOR:**
> - Accent color: `#5E0ED7` (deep purple). Used for the logo dot, the "+" symbols in stats, and the CTA link text.
> - All body text is black (#000).
>
> ---
>
> **FONT:**
> - Font family: `'Inter', sans-serif` applied to the root container.
> - All text is uppercase with wide letter-spacing (`tracking-widest` or `tracking-wide`).
> - Font weights: 600 (semibold) throughout.
>
> ---
>
> **LAYOUT (flex column, min-h-screen):**
> The page is a flex column with three vertical sections:
> 1. **Nav** (top, fixed height)
> 2. **Stats row** (flex-1, vertically centered, right-aligned)
> 3. **Bottom content** (pinned to bottom with padding)
>
> ---
>
> **NAVIGATION BAR:**
> - Horizontal flex, items centered, justified between. Padding: `px-5 sm:px-8 md:px-12 pt-5 md:pt-6`.
> - **Left:** A circular logo — 32px round div with 2px border in accent color, containing a 10px solid circle in accent color.
> - **Center (hidden on mobile, visible md+):** Four nav links: "Story", "Expertise", "Studios", "Feedback". Text: 14px, font-semibold, tracking-widest, uppercase, black.
> - **Right…

### E5 · Digital Director

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/digital-director) · [finished media](https://media.goodcase.ai/cases/2b0c6f1dcdb5.mp4) · [poster](https://media.goodcase.ai/cases/9fa7afd4fd0e.webp) · [original source](https://motionsites.ai/?prompt=digital-director)
- Summary: 作品集落地页的像素级复刻题，技术栈和结构用分隔线排成文档，prompt 本身就像一份规格书。
- Prompt excerpt:

> Recreate this exact full-viewport portfolio landing page — pixel-perfect match.
>
> ═══════════════════════════════════════
> TECH / STACK
> ═══════════════════════════════════════
> - React + TypeScript + Tailwind CSS + Vite
> - Icons: lucide-react (`Play`, `Menu`, `X`)
> - Single full-screen page: `h-screen w-full overflow-hidden`
> - Root: `relative h-screen w-full overflow-hidden bg-black text-white`
>
> ═══════════════════════════════════════
> FONTS (exact)
> ═══════════════════════════════════════
> Load in <head>:
>
> 1) Inter (Google Fonts) — body/default:
> <link rel="preconnect" href="https://fonts.googleapis.com">
> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
>
> 2) basis33 (pixel/bitmap monospace) — for `.font-pixel`:
> <link href="https://db.onlinewebfonts.com/c/d08bafd725a4cfc309efb5a88e0b63a5?family=basis33" rel="stylesheet">
>
> CSS:
> - body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
> - .font-pixel { font-family: 'basis33', monospace; }
>
> Where basis33 (font-pixel) is used:
> - "ROBERTS" under ADAM
> - "ENGINEERING" under DESIGN &
> - Brand blurb under name
> - Labels "What I Do" and "Services"
> - Words "UNEXPECTED" and "EXPERIENCES" inside the hero headline (1.25em size)
>
> Where Inter is used:
> - Everything else (nav, ADAM, DESIGN &, body copy, showreel button, awards, footer)
>
> Page title: "Adam Roberts - Design & Engineering"
>
> ═══════════════════════════════════════
> BACKGROUND VIDEO (exact URL…

### E6 · Max Reed Portfolio

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/max-reed-portfolio) · [finished media](https://media.goodcase.ai/cases/345c1b608f88.webp) · [original source](https://motionsites.ai/?prompt=max-reed-portfolio)
- Summary: 个人作品集的暗色 Features 区块，React + TypeScript + Tailwind + lucide-react。
- Prompt excerpt:

> Build a full-viewport dark personal portfolio Features section using React + TypeScript + Tailwind CSS + lucide-react.
>
> **Layout & Structure:**
> - Full screen dark background `#0a0a0a`, white text, Inter font with antialiased smoothing
> - Top header row: left side has a heading "Hi, I'm Max Reed!" (size `text-[28px] sm:text-3xl md:text-4xl lg:text-[44px]`, leading `1.15`, font-normal, tracking-tight) followed by a paragraph "A London-based independent creator shaping sharp visual systems, web-ready products, and story-first campaigns. With a decade of craft behind me, I help ideas move with focus and intention." (text-sm md:text-[15px], leading-[1.6], text-white/60, max-w-3xl). Header container has `max-w-3xl`.
> - Right side of header: a liquid-glass rounded-full button "Let's Team Up Today" (px-5 sm:px-6, py-2.5 sm:py-3)
> - Overall section padding: `px-4 sm:px-6 md:px-10 lg:px-14 py-6 sm:py-8 md:py-10`, full screen `lg:h-screen`
>
> **Grid (3 columns on lg, 2 on md, 1 on mobile, gap-4 md:gap-5):**
>
> **Column 1 - Background card (rounded-2xl, bg-black):**
> - Background video: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_150203_44a5bd32-516a-47ce-a077-8acbf9aa8991.mp4` (autoPlay loop muted playsInline, absolute inset-0 object-cover)
> - Top: centered "BACKGROUND" section label (uppercase, tracking-[0.22em], text-[11px], text-white/70) with Sparkle icons on each side (h-3 w-3, strokeWidth 1.5)
> - Bottom: career timeline as a 4-col grid `[auto_auto_1fr_auto]`:
>   - 2023-Now · Freelance Creative · Solo Studio
>   - 2020-2023 · Head of Brand Design · Rove…

### E7 · Modern Agency

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/modern-agency) · [finished media](https://media.goodcase.ai/cases/4782ee3ed985.webp) · [original source](https://motionsites.ai/?prompt=modern-agency)
- Summary: 设计机构 Axion Studio 的落地页，hero 背景用 shaders 包做着色器效果，这批里唯一用 WebGL 着色器的。
- Prompt excerpt:

> Build a React + Vite + Tailwind CSS landing page for "Axion Studio" - a design agency site. Use the `shaders` package (npm: `shaders`) for the hero background, `lucide-react` for icons. The page has 3 sections. Match every detail exactly:
>
> ---
>
> ## SECTION 1: HERO (Full viewport height)
>
> **Background:** Light gray `#EFEFEF` with a full-screen animated shader overlay (positioned absolute, inset-0, z-10, pointer-events-none). The shader stack uses components from `shaders/react`:
> - `Swirl` - colorA: `#ffffff`, colorB: `#f0f0f0`, detail: 1.7
> - `ChromaFlow` - baseColor: `#ffffff`, downColor/leftColor/rightColor/upColor: `#ff5f03`, momentum: 13, radius: 3.5
> - `FlutedGlass` - aberration: 0.61, angle: 31, frequency: 8, highlight: 0.12, highlightSoftness: 0, lightAngle: -90, refraction: 4, shape: "rounded", softness: 1, speed: 0.15
> - `FilmGrain` - strength: 0.05
>
> **Navigation (z-20, relative):** A pill-shaped white navbar (`bg-white rounded-full`) with 5px padding, inside a max-w-[1440px] container with p-2 sm:p-3.
>
> - LEFT: Dark circle logo (w-9 h-9 sm:w-10 sm:h-10, bg-gray-900, rounded-full) with white text "AX" (10px/11px, font-bold, tracking-tight). Next to it (hidden on mobile, shown md+): nav links "Projects", "Studio", "Journal", "Connect" - 14px, text-gray-900, hover:text-gray-500, transition-colors duration-300, gap-6.
>
> - RIGHT (hidden on mobile, shown md+):
>   - Text "Taking on projects for Q1 2026" (13px, text-gray-600, hidden below lg)
>   - Clock icon (lucide, size 14) + live London time "{HH:MM} in London" (13px, text-gray-600)
>   - CTA button: bg-gray-900, text-white, 13p…

### E8 · Portfolio About

- Creator: MotionSites
- Evidence: [GoodCase](https://goodcase.ai/cases/portfolio-about) · [finished media](https://media.goodcase.ai/cases/64ad3c467e32.webp) · [original source](https://motionsites.ai/?prompt=portfolio-about)
- Summary: 个人站的 About Me 区块，React + framer-motion，Kanit 字体全字重加载，#0C0C0C 暗底。
- Prompt excerpt:

> **Prompt:**
>
> Create an "About Me" section using React, Tailwind CSS, and **framer-motion**. The site uses **Google Font "Kanit"** (weights 300-900) and a dark background `#0C0C0C`.
>
> **Section layout:**
> - Full-width section, `min-h-screen`, flexbox column, centered both axes
> - Padding: `px-5 sm:px-8 md:px-10 py-20`
> - Background: `#0C0C0C` (inherited from page)
> - `position: relative` -- the section has 4 decorative floating images placed absolutely in the corners
>
> **4 decorative corner images (absolute positioned, z-0):**
>
> 1. **Top-left** -- Moon icon
>    - URL: `https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png`
>    - Position: `top-[4%] left-[1%] sm:left-[2%] md:left-[4%]`
>    - Size: `w-[120px] sm:w-[160px] md:w-[210px] h-auto`
>    - Fade-in animation: `delay: 0.1`, slides from left (`x: -80, y: 0`), `duration: 0.9`
>
> 2. **Bottom-left** -- 3D object
>    - URL: `https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png`
>    - Position: `bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%]`
>    - Size: `w-[100px] sm:w-[140px] md:w-[180px] h-auto`
>    - Fade-in animation: `delay: 0.25`, slides from left (`x: -80, y: 0`), `duration: 0.9`
>
> 3. **Top-right** -- Lego icon
>    - URL: `https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png`
>    - Position: `top-[4%] right-[1%] sm:right-[2%] md:right-[4%]`
>    - Size: `w-[120px] sm:w-[160px] md:w-[210px] h-auto`
>    - Fade-in animation: `delay: 0.15`, slides…

## Evidence index

| Case | Creator | GoodCase evidence | Finished media | Original source | Card |
| --- | --- | --- | --- | --- | --- |
| 3D Jack Portfolio | MotionSites | [GoodCase](https://goodcase.ai/cases/3d-jack-portfolio) | [Media](https://media.goodcase.ai/cases/49f8aeaa5fab.mp4) | [Original](https://motionsites.ai/?prompt=3d-jack-portfolio-hero) | E1 |
| AI Designer Portfolio | MotionSites | [GoodCase](https://goodcase.ai/cases/ai-designer-portfolio) | [Media](https://media.goodcase.ai/cases/1095b425fdb4.gif) | [Original](https://motionsites.ai/?prompt=vortex-studio-hero) | E2 |
| Bold Studio | MotionSites | [GoodCase](https://goodcase.ai/cases/bold-studio) | [Media](https://media.goodcase.ai/cases/7f31efa5103a.webp) | [Original](https://motionsites.ai/?prompt=bold-studio) | E3 |
| Creative Studio | MotionSites | [GoodCase](https://goodcase.ai/cases/creative-studio) | [Media](https://media.goodcase.ai/cases/165720a4ee9a.webp) | [Original](https://motionsites.ai/?prompt=creative-studio) | E4 |
| Digital Director | MotionSites | [GoodCase](https://goodcase.ai/cases/digital-director) | [Media](https://media.goodcase.ai/cases/2b0c6f1dcdb5.mp4) | [Original](https://motionsites.ai/?prompt=digital-director) | E5 |
| Max Reed Portfolio | MotionSites | [GoodCase](https://goodcase.ai/cases/max-reed-portfolio) | [Media](https://media.goodcase.ai/cases/345c1b608f88.webp) | [Original](https://motionsites.ai/?prompt=max-reed-portfolio) | E6 |
| Modern Agency | MotionSites | [GoodCase](https://goodcase.ai/cases/modern-agency) | [Media](https://media.goodcase.ai/cases/4782ee3ed985.webp) | [Original](https://motionsites.ai/?prompt=modern-agency) | E7 |
| Portfolio About | MotionSites | [GoodCase](https://goodcase.ai/cases/portfolio-about) | [Media](https://media.goodcase.ai/cases/64ad3c467e32.webp) | [Original](https://motionsites.ai/?prompt=portfolio-about) | E8 |
| Portfolio Cosmic | MotionSites | [GoodCase](https://goodcase.ai/cases/portfolio-cosmic) | [Media](https://media.goodcase.ai/cases/cabdb2cf1961.gif) | [Original](https://motionsites.ai/?prompt=portfolio-cosmic-hero) | E— |
| Prisma Creative Studio | MotionSites | [GoodCase](https://goodcase.ai/cases/prisma-creative-studio) | [Media](https://media.goodcase.ai/cases/ba4c62201b67.webp) | [Original](https://motionsites.ai/?prompt=prisma-landing) | E— |
| Subscription Agency | MotionSites | [GoodCase](https://goodcase.ai/cases/subscription-agency) | [Media](https://media.goodcase.ai/cases/5762e3699e39.mp4) | [Original](https://motionsites.ai/?prompt=subscription-agency) | E— |

## Derivation boundary

- Inclusion means the published Case matched the method pattern; it does not prove the creator used this exact synthesized workflow.
- Popularity is not part of the Skill threshold.
- Treat GoodCase summaries as editorial evidence and the linked original source as primary evidence.
