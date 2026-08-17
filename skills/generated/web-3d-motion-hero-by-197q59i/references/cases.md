# Case evidence

This is an unofficial synthesis of a recurring method found in 11 published Cases attributed to viktoroddy. It is not an official Skill from that creator.

## Operating rule

Choose one evidence card below as the anchor before drafting. Inspect its finished media, then state which traits will be preserved, replaced, and avoided. A title match alone is not evidence.

### E1 · Claude 自动生成单页动效站

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/claude-53a17a454214) · [finished media](https://video.twimg.com/ext_tw_video/2040894830901858304/pu/vid/avc1/720x1272/a_aUMCoAo2TC-1Io.mp4?tag=12) · [poster](https://pbs.twimg.com/ext_tw_video_thumb/2040894830901858304/pu/img/8CvDfSYjdpzFuUrl.jpg) · [original source](https://x.com/viktoroddy/status/2040894867153338643)
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

### E2 · Claude Mythos：Lithos 地质品牌 Hero

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/claude-mythos-lithos-hero-df0603661e88) · [finished media](https://video.twimg.com/amplify_video/2065417644782804992/vid/avc1/2924x2160/OAX73syzQa-_wlAg.mp4?tag=27) · [poster](https://pbs.twimg.com/amplify_video_thumb/2065417644782804992/img/XZjHj3QcKhMDc7gL.jpg) · [original source](https://x.com/viktoroddy/status/2065418614627602509)
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

### E3 · Claude + Nano Banana + Kling 动画网站

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/claude-nano-banana-kling-37787d8ec68d) · [finished media](https://video.twimg.com/amplify_video/2042188295376179200/vid/avc1/1526x1728/uT80dVqvhGdiDYq5.mp4?tag=21) · [poster](https://pbs.twimg.com/amplify_video_thumb/2042188295376179200/img/JsuJb2i3z6d2ju58.jpg) · [original source](https://x.com/viktoroddy/status/2042188738818957631)
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

### E4 · Fable 与 Opus 同 Prompt 滚动页对比

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/fable-opus-prompt-12601c6e0cf5) · [finished media](https://video.twimg.com/amplify_video/2072996449647050754/vid/avc1/1920x762/-VV1YDl19laV5__U.mp4?tag=28) · [poster](https://pbs.twimg.com/amplify_video_thumb/2072996449647050754/img/JIzHGgUb4oNG7bmC.jpg) · [original source](https://x.com/viktoroddy/status/2072997540451258848)
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
> **Text:** "Unleash The\nFull Power" (two lines)
>
> **Font:** Custom "Dirtyline 36 Days of Type 2022" loaded from `/Dirtyline-36daysoftype-2022.woff2` via `@font-face`. Registered as Tailwind font `…

### E5 · Gemini 3.1 一次生成动效网站

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/gemini-3-1-65cd001c4cd3) · [finished media](https://video.twimg.com/amplify_video/2026249412696297473/vid/avc1/1440x1080/R9hPUCWRnhz8ybRp.mp4?tag=21) · [poster](https://pbs.twimg.com/amplify_video_thumb/2026249412696297473/img/_XYDn4E2VT1pkj09.jpg) · [original source](https://x.com/viktoroddy/status/2026249809506811965)
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

### E6 · Grok Imagine + Grok Build：Veldara Hero

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/grok-imagine-grok-build-veldara-hero-d38c65fbe7af) · [finished media](https://video.twimg.com/amplify_video/2067217720110968832/vid/avc1/3044x2160/BYpABSzBrZJU0OwV.mp4?tag=28) · [poster](https://pbs.twimg.com/amplify_video_thumb/2067217720110968832/img/xKBucVR1YItXGLwE.jpg) · [original source](https://x.com/viktoroddy/status/2067218410350797295)
- Summary: @viktoroddy 使用 Grok Imagine · Grok Build完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> ❤️‍🔥 Access Full prompt for stunning animated websites in one click:
>
> Create a full-viewport hero section for a product called "Veldara" using React, Tailwind CSS, and Lucide React icons. The page should be a single-screen landing with no scrolling.
>
> > **Video Background:**
> > - Use this exact video URL, do NOT replace it with any other URL: ``
> > - The video wrapper is `position: absolute; inset: 0; z-index: 0` (NOT negative z-index, NOT fixed) placed as the first child inside the root container
> > - The root container (`relative h-screen overflow-hidden`) must have NO background-color set (transparent) so the video shows through
> > - The `<video>` element has: `muted`, `loop`, `playsInline`, `autoPlay`, `preload="auto"`, class `absolute inset-0 w-full h-full object-cover`
> > - Do NOT add `crossOrigin` attribute on the video (it can block playback on some CDNs)
> > - All content layers must use positive z-index values above 0 (particles z-[3], nav z-50, hero content z-[2])
> > - CRITICAL: Do NOT use `z-index: -1` or `position: fixed` for the video -- it must be inside the stacking context, not behind it
>
> **Floating Particles:**
> - Render a full-screen canvas (fixed, `pointer-events-none`, `z-index: 3`) with animated floating particles
> - Particle count: `(canvas.width * canvas.height) / 12000`
> - Each particle: random size 0.5-2px, white with random opacity 0.2-0.8, drifting at velocity 0.3px/frame in random directions
> - Particles wrap around edges
>
> **Navigation Bar (fixed, top, z-50):**
> - Left side: Bold white logo text "veldara" (text-lg on mobile, text-xl on desktop, tracking-tig…

### E7 · 太空旅行全屏动画 Hero

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/hero-28fa1f798ac0) · [finished media](https://video.twimg.com/amplify_video/2029971487202103297/vid/avc1/1686x1080/zNWX4UD1yqghfhq3.mp4?tag=21) · [poster](https://pbs.twimg.com/amplify_video_thumb/2029971487202103297/img/M-yyGrxSswPjoC6W.jpg) · [original source](https://x.com/viktoroddy/status/2029971732443058437)
- Summary: @viktoroddy 使用 React · Vite · TypeScript完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Unlimited Aniamted AI Heros -
>
> Here’s the exact prompt I used:
>
> Build a full-screen cinematic hero section for a space travel website using React, Vite, TypeScript, Tailwind CSS, and the motion/react (Framer Motion) library. Recreate every detail exactly as described below.
>
> 1. Fonts
>
> Import Instrument Serif (italic) and Barlow (weights 300, 400, 500, 600) from Google Fonts:
> @import url('');
> Register them in tailwind.config.ts:
> fontFamily: {
> heading: ["'Instrument Serif'", "serif"],
> body: ["'Barlow'", "sans-serif"],
> }
> Set --radius: 9999px for fully rounded elements. Use an HSL-based color system where --background: 213 45% 67% (muted sky blue) and --foreground: 0 0% 100% (white).
>
> 2. Background Video
>
> Use a full-screen <video> element positioned absolute inset-0 with object-cover, z-0, and these attributes: autoPlay loop muted playsInline preload="auto".
>
> Video URL:
>
> Poster image: /images/hero_bg.jpeg
>
> Overlay: A div with absolute inset-0 bg-black/5 z-0 on top of the video.
>
> In index.html, add preload hints in <head>:
>
> <link rel="preload" as="image" href="/images/hero_bg.jpeg" type="image/jpeg" />
> <link rel="preload" as="video" href="" type="video/mp4" />
>
> 3. Liquid Glass CSS
>
> Define two utility classes in index.css under @layer components:
>
> .liquid-glass (light):
>
> .liquid-glass {
> background: rgba(255, 255, 255, 0.01);
> background-blend-mode: luminosity;
> backdrop-filter: blur(4px);
> -webkit-backdrop-filter: blur(4px);
> border: none;
> box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
> position: relative;
> overflow: hidden;
> }
> .liquid-glass::before {
> content: '';
> position: abs…

### E8 · Nano Banana + Flow + AntiGravity 动效网站

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/nano-banana-flow-antigravity-423c21fb568e) · [finished media](https://video.twimg.com/amplify_video/2027664570060550145/vid/avc1/1520x1080/-9gPPS697Zzh7MLK.mp4?tag=21) · [poster](https://pbs.twimg.com/amplify_video_thumb/2027664570060550145/img/-c8V_npE6GR_Sivw.jpg) · [original source](https://x.com/viktoroddy/status/2027664654252839271)
- Summary: @viktoroddy 使用 Nano Banana · Flow · AntiGravity完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Prompt:
>
> Build a premium, high-end hero section for a video editing agency named 'Logoisum' with the following specifications:
>
> Background: Implement a full-screen, looping video background using this URL: . The video must be muted, autoplaying, and set to object-cover to fill the section without any color overlays.
>
> Navigation Bar: A floating white navigation bar with rounded-[16px] and a subtle shadow.
>
> Left: The agency logo.
> Center: A menu with links for 'About', 'Works', 'Services', and 'Testimonial' using 14px Barlow Medium font.
> Right: A dark (#222) primary CTA button labeled 'Book A Free Meeting' featuring a unique 45-degree arrow icon in a circular housing.
> Typography & Hero Content:
>
> Primary Headline: Centered layout. The first line 'Agency that makes your' should use a bold/medium Barlow font with tight tracking (tracking-[-4px]). The second line 'videos & reels viral' must use a large, elegant 'Instrument Serif' italic font (text-[84px]).
> Subtext: Below the headline, add the text 'Short-form video editing for Influencers, Creators and Brands' in Barlow Medium, 18px, centered.
> Secondary CTA: A large white pill-shaped button below the subtext labeled 'See Our Workreel' with a small play icon on the left.
> Overall Aesthetic: The design should be minimal, ultra-modern, and responsive. Ensure all text and buttons are layered on top of the video background with clear visibility and proper spacing (min-h-[90vh])."

## Evidence index

| Case | Creator | GoodCase evidence | Finished media | Original source | Card |
| --- | --- | --- | --- | --- | --- |
| Claude 自动生成单页动效站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/claude-53a17a454214) | [Media](https://video.twimg.com/ext_tw_video/2040894830901858304/pu/vid/avc1/720x1272/a_aUMCoAo2TC-1Io.mp4?tag=12) | [Original](https://x.com/viktoroddy/status/2040894867153338643) | E1 |
| Claude Mythos：Lithos 地质品牌 Hero | @viktoroddy | [GoodCase](https://goodcase.ai/cases/claude-mythos-lithos-hero-df0603661e88) | [Media](https://video.twimg.com/amplify_video/2065417644782804992/vid/avc1/2924x2160/OAX73syzQa-_wlAg.mp4?tag=27) | [Original](https://x.com/viktoroddy/status/2065418614627602509) | E2 |
| Claude + Nano Banana + Kling 动画网站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/claude-nano-banana-kling-37787d8ec68d) | [Media](https://video.twimg.com/amplify_video/2042188295376179200/vid/avc1/1526x1728/uT80dVqvhGdiDYq5.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2042188738818957631) | E3 |
| Fable 与 Opus 同 Prompt 滚动页对比 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/fable-opus-prompt-12601c6e0cf5) | [Media](https://video.twimg.com/amplify_video/2072996449647050754/vid/avc1/1920x762/-VV1YDl19laV5__U.mp4?tag=28) | [Original](https://x.com/viktoroddy/status/2072997540451258848) | E4 |
| Gemini 3.1 一次生成动效网站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/gemini-3-1-65cd001c4cd3) | [Media](https://video.twimg.com/amplify_video/2026249412696297473/vid/avc1/1440x1080/R9hPUCWRnhz8ybRp.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2026249809506811965) | E5 |
| Grok Imagine + Grok Build：Veldara Hero | @viktoroddy | [GoodCase](https://goodcase.ai/cases/grok-imagine-grok-build-veldara-hero-d38c65fbe7af) | [Media](https://video.twimg.com/amplify_video/2067217720110968832/vid/avc1/3044x2160/BYpABSzBrZJU0OwV.mp4?tag=28) | [Original](https://x.com/viktoroddy/status/2067218410350797295) | E6 |
| 太空旅行全屏动画 Hero | @viktoroddy | [GoodCase](https://goodcase.ai/cases/hero-28fa1f798ac0) | [Media](https://video.twimg.com/amplify_video/2029971487202103297/vid/avc1/1686x1080/zNWX4UD1yqghfhq3.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2029971732443058437) | E7 |
| Nano Banana + Flow + AntiGravity 动效网站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/nano-banana-flow-antigravity-423c21fb568e) | [Media](https://video.twimg.com/amplify_video/2027664570060550145/vid/avc1/1520x1080/-9gPPS697Zzh7MLK.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2027664654252839271) | E8 |
| Nano Banana + Kling + Claude 电影感 Hero | @viktoroddy | [GoodCase](https://goodcase.ai/cases/nano-banana-kling-claude-hero-9301b1057401) | [Media](https://video.twimg.com/amplify_video/2037818476757463040/vid/avc1/2442x1556/VhBh-bYypj1yTc5Q.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2037902313910899150) | E— |
| Nano Banana + Veo 3 + Lovable 动效站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/nano-banana-veo-3-lovable-a22361354031) | [Media](https://video.twimg.com/amplify_video/2033967090965876738/vid/avc1/2540x1622/6U4zJuXDm_nfqLLb.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2033967195924144341) | E— |
| 应式3D角色轮播动画UI | @viktoroddy | [GoodCase](https://goodcase.ai/cases/real-case-12-viktoroddy) | [Media](https://goodcase.ai/media/goodcase/viktoroddy-2054885940183880156-01.mp4) | [Original](https://x.com/viktoroddy/status/2054885940183880156) | E— |

## Derivation boundary

- Inclusion means the published Case matched the method pattern; it does not prove the creator used this exact synthesized workflow.
- Popularity is not part of the Skill threshold.
- Treat GoodCase summaries as editorial evidence and the linked original source as primary evidence.
