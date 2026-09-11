# Case evidence

This is an unofficial synthesis of a recurring method found in 14 published Cases attributed to viktoroddy. It is not an official Skill from that creator.

## Operating rule

Choose one evidence card below as the anchor before drafting. Inspect its finished media, then state which traits will be preserved, replaced, and avoided. A title match alone is not evidence.

### E1 · AntiGravity + Gemini 3.1 落地页

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/antigravity-gemini-3-1-5e49aad75b25) · [finished media](https://media.goodcase.ai/media/video/antigravity-gemini-3-1-5e49aad75b25.mp4) · [poster](https://media.goodcase.ai/media/poster/antigravity-gemini-3-1-5e49aad75b25.jpg) · [original source](https://x.com/viktoroddy/status/2024832167164133766)
- Summary: @viktoroddy 使用 AntiGravity · Gemini 3.1 Pro完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Prompt:
>
> Build a hero section with the following exact specifications:
>
> Overall Layout:
>
> Full-width section with background: #000000 (pure black)
> Overflow hidden
> Background video playing behind all content (details below)
> Background Video:
>
> Source:
> Autoplay, loop, muted, playsInline
> Scaled to 120% of the container (width and height both 120%)
> Horizontally centered, focal point anchored to the bottom
> Sits behind all content (lowest z-index)
> Blurred Background Element:
>
> Absolute positioned, horizontally centered, top offset ~215px
> Size: 801px wide × 384px tall, fully rounded (pill shape)
> Color: pure black #000000
> Blur: 77.5px
> z-index: 1 (above video, below content)
> All text and UI content sits at z-index: 2 (above everything)
>
> Navbar (top):
>
> Max width: 1440px, centered horizontally
>
> Horizontal padding: 120px, vertical padding: 16px, height: 102px
>
> Flexbox row, space-between alignment
>
> Left side: Logo + nav links with 80px gap between them
>
> Logo: "LOGOIPSUM" SVG mark, 134px × 25px, white fill
> Nav links in a row with 10px gap between items
> Each link: font Manrope, medium weight, 14px size, 22px line-height, white color, padding 10px horizontal / 4px vertical
> Items: "Home", "Services" (with a 24×24 white chevron-down icon to the right, 3px gap), "Reviews", "Contact us"
> Right side: Two buttons with 12px gap
>
> "Sign In" button: white background, 16px horizontal / 8px vertical padding, 8px border-radius, Manrope semibold 14px/22px, color #171717, with a 1px #d4d4d4 border overlay
> "Get Started" button: background #7b39fc (purple), 16px/8px padding, 8px border-radius, Manrope semibol…

### E2 · Claude 自动生成单页动效站

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/claude-53a17a454214) · [finished media](https://media.goodcase.ai/media/video/claude-53a17a454214.mp4) · [poster](https://media.goodcase.ai/media/poster/claude-53a17a454214.jpg) · [original source](https://x.com/viktoroddy/status/2040894867153338643)
- Summary: @viktoroddy 使用 Claude完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Access ALL prompts for stunning animated websites in one click:
>
> Prompt:
>
> Build a single-page landing site using React + TypeScript + Vite + Tailwind CSS + framer-motion + lucide-react. The entire page has a bg-black background. The font loaded via Google Fonts is Instrument Serif (italic and regular). Import it in index.css:
>
> @import url('');
> LIQUID GLASS CSS (in index.css, inside @layer components)
> Create a reusable .liquid-glass class used on every glass element:
>
> .liquid-glass {
>  background: rgba(255, 255, 255, 0.01);
>  background-blend-mode: luminosity;
>  backdrop-filter: blur(4px);
>  -webkit-backdrop-filter: blur(4px);
>  border: none;
>  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
>  position: relative;
>  overflow: hidden;
> }
>
> .liquid-glass::before {
>  content: '';
>  position: absolute;
>  inset: 0;
>  border-radius: inherit;
>  padding: 1.4px;
>  background: linear-gradient(
>  180deg,
>  rgba(255, 255, 255, 0.45) 0%,
>  rgba(255, 255, 255, 0.15) 20%,
>  rgba(255, 255, 255, 0) 40%,
>  rgba(255, 255, 255, 0) 60%,
>  rgba(255, 255, 255, 0.15) 80%,
>  rgba(255, 255, 255, 0.45) 100%
>  );
>  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
>  -webkit-mask-composite: xor;
>  mask-composite: exclude;
>  pointer-events: none;
> }
> SECTION 1 -- HERO (full-viewport, in Index.tsx)
> Full-screen (min-h-screen) container with overflow-hidden relative flex flex-col.
>
> Background video: absolute, covers the entire viewport (absolute inset-0 w-full h-full object-cover object-bottom). URL:
>
>
> Attributes: muted, autoPlay, playsInline, preload="auto". Starts at opacity: 0.
>
> Video fade logic (…

### E3 · Claude + Fable：Aethera Fintech 落地页

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/claude-fable-aethera-fintech-42f59ca99541) · [finished media](https://media.goodcase.ai/media/video/claude-fable-aethera-fintech-42f59ca99541.mp4) · [poster](https://media.goodcase.ai/media/poster/claude-fable-aethera-fintech-42f59ca99541.jpg) · [original source](https://x.com/viktoroddy/status/2077366050828751274)
- Summary: @viktoroddy 使用 Claude · Fable完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Access ALL prompts for stunning animated websites in one click:
>
> > Build a single-page landing page for a brand called **"Aethera"** (a fintech/AI company for lending). Use **React + TypeScript + Vite + Tailwind CSS + lucide-react**. The page has a white background (`#fff`), no scrolling animations -- just a clean, minimal, editorial design.
> >
> > ### Fonts
> > - **Heading/serif font:** "P22 Mackinac W01 Book" loaded from ``
> > - **Body/sans font:** "Inter" (weights 300, 400, 500, 600) from Google Fonts
> > - Configure Tailwind: `fontFamily.sans = ['Inter', 'sans-serif']`, `fontFamily.serif = ['P22 Mackinac W01 Book', 'Georgia', 'serif']`
> >
> > ### Page Title
> > `<title>Build Lasting Relationships</title>`
> >
> > ### Background Video
> It has to be centered vertically on the page
> > Use this **exact** CloudFront video URL:
> > ```
> >
> > ```
> > The video is positioned **absolutely** behind the hero using: top: '50%', transform: 'translateY(-50%)'
>  and CSS filter `brightness(1) contrast(1.2)`. It uses `object-contain`, is muted, playsInline, preload="auto". It plays once on load and pauses when ended (no looping, no boomerang reversal -- just plays forward once and stops).
> >
> > ### Navbar
> > - `relative z-20`, max-width `max-w-7xl`, centered, `px-8 py-6`, flex between.
> > - **Logo (left):** Text "Aethera" with a superscript registered mark -- `font-serif text-3xl tracking-tight text-[#000000]` with `<sup className="text-xs align-super">®</sup>`
> > - **Navigation links (center, hidden on mobile `hidden md:flex`):** "Home" (active, `text-[#000000]`), "Studio", "About", "Journal", "Reach Us" (inactiv…

### E4 · Claude Mythos：Lithos 地质品牌 Hero

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/claude-mythos-lithos-hero-df0603661e88) · [finished media](https://media.goodcase.ai/media/video/claude-mythos-lithos-hero-df0603661e88.mp4) · [poster](https://media.goodcase.ai/media/poster/claude-mythos-lithos-hero-df0603661e88.jpg) · [original source](https://x.com/viktoroddy/status/2065418614627602509)
- Summary: @viktoroddy 使用 Claude Mythos完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> ❤️‍🔥Access ALL prompts for stunning animated websites in one click:
> http://
>
>
> Build a full-screen, dark-themed hero section for a geology brand called **Lithos**, using **React 18 + TypeScript + Vite + Tailwind CSS** and **lucide-react** for icons. The signature feature is a **cursor-following spotlight that reveals a second image** through a soft circular mask on top of a base image. Match every detail below exactly.
>
> ### Fonts
> Add this to the top of `src/index.css`, then `@tailwind base/components/utilities`:
> ```css
> @import url('');
> * { font-family: 'Inter', sans-serif; }
> .font-playfair { font-family: 'Playfair Display', serif; }
> ```
> - Body/UI font: **Inter**.
> - Display/wordmark accent: **Playfair Display, italic**.
>
> ### Asset URLs (use these exactly)
> - Base image (`BG_IMAGE_1`):
>   ``
> - Reveal image (`BG_IMAGE_2`):
>   ``
>
> ### Layout & structure
> Root wrapper: `min-h-screen bg-white tracking-[-0.02em]`, inline `fontFamily: "'Inter', sans-serif"`.
>
> **Section** (`<section>`): `relative w-full overflow-hidden h-screen bg-black`, inline `style={{ height: '100dvh' }}`. Layers, by z-index:
> 1. **Base image** (`z-10`): `absolute inset-0 bg-center bg-cover bg-no-repeat`, background = `BG_IMAGE_1`.
> 2. **Reveal layer** (`z-30`): a `RevealLayer` component (see below) showing `BG_IMAGE_2`.
> 3. **Heading** (`z-50`): `absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none`. An `<h1>` with `text-white leading-[0.95]` containing two block spans:
>    - Line 1: `block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl`, inline `letterSp…

### E5 · Claude + Nano Banana + Kling 动画网站

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/claude-nano-banana-kling-37787d8ec68d) · [finished media](https://media.goodcase.ai/media/video/claude-nano-banana-kling-37787d8ec68d.mp4) · [poster](https://media.goodcase.ai/media/poster/claude-nano-banana-kling-37787d8ec68d.jpg) · [original source](https://x.com/viktoroddy/status/2042188738818957631)
- Summary: @viktoroddy 使用 Claude Code · Nano Banana Pro · Kling完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Access ALL prompts for stunning animated websites in one click:
>
> RECREATION PROMPT
>
> PROMPT:
>
> Build a React + Vite + TypeScript + Tailwind CSS landing page for a creative studio called "Aethera". The site is light-mode only (no dark mode). It uses two Google Fonts: Instrument Serif (display/headings) and Inter (body text). Use lucide-react for all icons. The site has a cinematic video hero and 7 additional sections below it. All sections use scroll-triggered reveal animations via an IntersectionObserver hook.
>
> GLOBAL SETUP
> Fonts (src/styles/fonts.css)
> Import from Google Fonts:
>
> Instrument Serif (italic variants: 0 and 1)
> Inter (weights: 300, 400, 500, 600)
> Tailwind Config (tailwind.config.js)
> Extend theme with:
>
> fontFamily.display: "Instrument Serif", serif
> fontFamily.body: Inter, sans-serif
> colors.background: #FFFFFF
> colors.foreground: #000000
> colors.muted: #6F6F6F
> CSS Animations (src/styles/theme.css)
> Define these keyframe animations:
>
> fade-rise: opacity 0 -> 1, translateY(20px -> 0), 0.8s ease-out
> fade-in: opacity 0 -> 1
> slide-up: opacity 0 -> 1, translateY(40px -> 0)
> count-up: opacity 0 -> 1, scale(0.8 -> 1)
> Utility classes:
>
> .animate-fade-rise: 0.8s ease-out forwards
> .animate-fade-rise-delay: same but 0.2s delay, starts opacity:0
> .animate-fade-rise-delay-2: same but 0.4s delay, starts opacity:0
> Scroll-reveal system:
>
> .reveal: starts opacity:0, translateY(32px), transitions opacity and transform 0.7s ease-out
> .reveal.visible: opacity:1, translateY(0)
> .reveal-stagger-1 through .reveal-stagger-6: transition-delays from 0.1s to 0.6s in 0.1s increments
> Global CSS (src/inde…

### E6 · Fable 与 Opus 同 Prompt 滚动页对比

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/fable-opus-prompt-12601c6e0cf5) · [finished media](https://media.goodcase.ai/media/video/fable-opus-prompt-12601c6e0cf5.mp4) · [poster](https://media.goodcase.ai/media/poster/fable-opus-prompt-12601c6e0cf5.jpg) · [original source](https://x.com/viktoroddy/status/2072997540451258848)
- Summary: @viktoroddy 使用 Fable · Claude Opus完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> ❤️‍🔥 Access ALL prompts for Premium AI websites in one click:
>
> Build a scroll-driven hero landing page in React + TypeScript + Vite + Tailwind CSS v4. The page has a black background, white text, and 3 main elements: a scroll-scrubbed background video, a floating text overlay that animates out on scroll, a pill-shaped navigation bar, and a glass panel that slides up from below.
>
> ---
>
> ## VIDEO (Background, scroll-scrubbed)
>
> **URL:** ``
>
> - Fixed position, full viewport, z-index 0, scaled 1.05 at the wrapper and 1.35 on the video element itself (for parallax mouse effect coverage).
> - Video is always paused; time is controlled manually via scroll.
> - Uses HLS.js if the source is `.m3u8`, otherwise native `<video>`.
> - Scroll-scrubbing logic uses `requestAnimationFrame` loop:
> - Calculates `scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)`, clamped 0-1.
> - `targetTime = progress * (video.duration - 0.05)`
> - Smooth interpolation: `currentTime += (targetTime - currentTime) * 0.08`
> - Back-pressure guard: only sets `video.currentTime` when `!video.seeking` and delta > 0.01.
> - Mouse parallax on the wrapper: on `mousemove`, GSAP tweens `x` and `y` by +/-30px based on normalized mouse position, duration 1.5s, `power2.out` ease.
> - Shows a loading overlay ("Loading... X%") until `canplay` fires, with buffer progress tracked.
>
> ---
>
> ## SCROLL FLOAT TEXT
>
> **Text:** "Unleash The
> Full Power" (two lines)
>
> **Font:** Custom "Dirtyline 36 Days of Type 2022" loaded from `/Dirtyline-36daysoftype-2022.woff2` via `@font-face`. Registered as Tailwind font `f…

### E7 · Gemini 3.1 一次生成动效网站

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/gemini-3-1-65cd001c4cd3) · [finished media](https://media.goodcase.ai/media/video/gemini-3-1-65cd001c4cd3.mp4) · [poster](https://media.goodcase.ai/media/poster/gemini-3-1-65cd001c4cd3.jpg) · [original source](https://x.com/viktoroddy/status/2026249809506811965)
- Summary: @viktoroddy 使用 Gemini 3.1完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> PROMPT:
>
> Build a premium electric vehicle landing page with a dark, cinematic aesthetic. The entire site uses a black background (hsl(0,0%,0%)) with light text (hsl(0,0%,95%) as primary) and orange accents (hsl(25,100%,50%)). No default fonts — keep it minimal and editorial. Use shadcn/ui design tokens. Here are the sections in order:
>
> Design System (index.css)
> --background: 0 0% 0%
> --foreground: 0 0% 12% (used for dark elements like CTA button inner circles)
> --primary: 0 0% 95% (near-white, used for all text)
> --primary-foreground: 0 0% 12%
> --accent-warm: 25 90% 55% (orange accent)
> All section backgrounds are pure black hsl(0,0%,0%)
> Section 1: Navbar
> Fixed top, full-width, rounded-full pill shape
> Transparent initially, on scroll: black bg with backdrop-blur-xl, border primary/10
> Logo left: "Electric" with an orange dot "." — logo color changes from black to white on scroll
> Nav links: Services, About, Team, Contact — hover has a scale-up rounded bg pill effect
> CTA button right: "Get Started" with a rounded-full pill, contains an ArrowUpRight icon inside a circular foreground bg
> CTA switches from black bg to white bg on scroll
> Mobile: hamburger menu, opens a rounded dark overlay with links + CTA
> Section 2: Hero
> Full viewport height, video background (/videos/hero_bg.mp4, autoplay, loop, muted)
> Large heading top-left: "Drive Beyond. / Unlock Pure Power" — white text, 78px on desktop
> Below heading: "Learn more" link with arrow icon, bordered button (border-foreground), no fill
> Section 3: Connected Systems (BigLinks)
> Top half: Video background (/videos/biglinks_bg.mp4) with 60%…

### E8 · GPT Image 2 + Veo 3 + Lovable 营销站

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/gpt-image-2-veo-3-lovable-cec7a074af1a) · [finished media](https://media.goodcase.ai/media/video/gpt-image-2-veo-3-lovable-cec7a074af1a.mp4) · [poster](https://media.goodcase.ai/media/poster/gpt-image-2-veo-3-lovable-cec7a074af1a.jpg) · [original source](https://x.com/viktoroddy/status/2054291040379842795)
- Summary: @viktoroddy 使用 GPT Image 2 · Veo 3 · Lovable完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Access ALL prompts for stunning animated websites in one click:
>
> # PROMPT: Recreate this landing page exactly
>
> Build a production-quality marketing landing page for a thoughtful newsletter platform called "Mindloop" as a Vite + React + TypeScript app using Tailwind CSS, shadcn/ui, framer-motion, and lucide-react. The aesthetic is calm, editorial, cinematic — black background, white foreground, serif italic accents, ambient looping background videos, and a signature "liquid glass" effect on interactive surfaces. No purple/indigo hues.
>
> ## Stack & dependencies
>
> - Vite + React 18 + TypeScript
> - Tailwind CSS with shadcn/ui design tokens (HSL CSS variables)
> - `framer-motion` for animation
> - `lucide-react` for icons
> - `@fontsource/inter` (400, 500, 600, 700) and `@fontsource/instrument-serif` (400, 400-italic) for fonts
> - Do NOT install other UI libraries
>
> ## Global theme (src/index.css)
>
> Import fontsource CSS at top, then Tailwind layers. Pure black/white palette via HSL vars:
>
> ```css
> @import "@fontsource/inter/400.css";
> @import "@fontsource/inter/500.css";
> @import "@fontsource/inter/600.css";
> @import "@fontsource/inter/700.css";
> @import "@fontsource/instrument-serif/400.css";
> @import "@fontsource/instrument-serif/400-italic.css";
>
> @tailwind base;
> @tailwind components;
> @tailwind utilities;
>
> @layer base {
>   :root {
>     --background: 0 0% 0%;
>     --foreground: 0 0% 100%;
>     --card: 0 0% 5%;
>     --card-foreground: 0 0% 100%;
>     --popover: 0 0% 5%;
>     --popover-foreground: 0 0% 100%;
>     --primary: 0 0% 100%;
>     --primary-foreground: 0 0% 0%;
>     --secondary: 0 0% 12%;
>     --se…

## Evidence index

| Case | Creator | GoodCase evidence | Finished media | Original source | Card |
| --- | --- | --- | --- | --- | --- |
| AntiGravity + Gemini 3.1 落地页 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/antigravity-gemini-3-1-5e49aad75b25) | [Media](https://media.goodcase.ai/media/video/antigravity-gemini-3-1-5e49aad75b25.mp4) | [Original](https://x.com/viktoroddy/status/2024832167164133766) | E1 |
| Claude 自动生成单页动效站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/claude-53a17a454214) | [Media](https://media.goodcase.ai/media/video/claude-53a17a454214.mp4) | [Original](https://x.com/viktoroddy/status/2040894867153338643) | E2 |
| Claude + Fable：Aethera Fintech 落地页 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/claude-fable-aethera-fintech-42f59ca99541) | [Media](https://media.goodcase.ai/media/video/claude-fable-aethera-fintech-42f59ca99541.mp4) | [Original](https://x.com/viktoroddy/status/2077366050828751274) | E3 |
| Claude Mythos：Lithos 地质品牌 Hero | @viktoroddy | [GoodCase](https://goodcase.ai/cases/claude-mythos-lithos-hero-df0603661e88) | [Media](https://media.goodcase.ai/media/video/claude-mythos-lithos-hero-df0603661e88.mp4) | [Original](https://x.com/viktoroddy/status/2065418614627602509) | E4 |
| Claude + Nano Banana + Kling 动画网站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/claude-nano-banana-kling-37787d8ec68d) | [Media](https://media.goodcase.ai/media/video/claude-nano-banana-kling-37787d8ec68d.mp4) | [Original](https://x.com/viktoroddy/status/2042188738818957631) | E5 |
| Fable 与 Opus 同 Prompt 滚动页对比 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/fable-opus-prompt-12601c6e0cf5) | [Media](https://media.goodcase.ai/media/video/fable-opus-prompt-12601c6e0cf5.mp4) | [Original](https://x.com/viktoroddy/status/2072997540451258848) | E6 |
| Gemini 3.1 一次生成动效网站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/gemini-3-1-65cd001c4cd3) | [Media](https://media.goodcase.ai/media/video/gemini-3-1-65cd001c4cd3.mp4) | [Original](https://x.com/viktoroddy/status/2026249809506811965) | E7 |
| GPT Image 2 + Veo 3 + Lovable 营销站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/gpt-image-2-veo-3-lovable-cec7a074af1a) | [Media](https://media.goodcase.ai/media/video/gpt-image-2-veo-3-lovable-cec7a074af1a.mp4) | [Original](https://x.com/viktoroddy/status/2054291040379842795) | E8 |
| Grok Imagine + Grok Build：Veldara Hero | @viktoroddy | [GoodCase](https://goodcase.ai/cases/grok-imagine-grok-build-veldara-hero-d38c65fbe7af) | [Media](https://media.goodcase.ai/media/video/grok-imagine-grok-build-veldara-hero-d38c65fbe7af.mp4) | [Original](https://x.com/viktoroddy/status/2067218410350797295) | E— |
| 太空旅行全屏动画 Hero | @viktoroddy | [GoodCase](https://goodcase.ai/cases/hero-28fa1f798ac0) | [Media](https://media.goodcase.ai/media/video/hero-28fa1f798ac0.mp4) | [Original](https://x.com/viktoroddy/status/2029971732443058437) | E— |
| Nano Banana + Flow + AntiGravity 动效网站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/nano-banana-flow-antigravity-423c21fb568e) | [Media](https://media.goodcase.ai/media/video/nano-banana-flow-antigravity-423c21fb568e.mp4) | [Original](https://x.com/viktoroddy/status/2027664654252839271) | E— |
| Nano Banana + Kling + Claude 电影感 Hero | @viktoroddy | [GoodCase](https://goodcase.ai/cases/nano-banana-kling-claude-hero-9301b1057401) | [Media](https://media.goodcase.ai/media/video/nano-banana-kling-claude-hero-9301b1057401.mp4) | [Original](https://x.com/viktoroddy/status/2037902313910899150) | E— |
| Nano Banana + Veo 3 + Lovable 动效站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/nano-banana-veo-3-lovable-a22361354031) | [Media](https://media.goodcase.ai/media/video/nano-banana-veo-3-lovable-a22361354031.mp4) | [Original](https://x.com/viktoroddy/status/2033967195924144341) | E— |
| 应式3D角色轮播动画UI | @viktoroddy | [GoodCase](https://goodcase.ai/cases/real-case-12-viktoroddy) | [Media](https://goodcase.ai/media/goodcase/viktoroddy-2054885940183880156-01.mp4) | [Original](https://x.com/viktoroddy/status/2054885940183880156) | E— |

## Derivation boundary

- Inclusion means the published Case matched the method pattern; it does not prove the creator used this exact synthesized workflow.
- Popularity is not part of the Skill threshold.
- Treat GoodCase summaries as editorial evidence and the linked original source as primary evidence.
