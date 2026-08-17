# Case evidence

This is an unofficial synthesis of a recurring method found in 10 published Cases attributed to viktoroddy. It is not an official Skill from that creator.

## Operating rule

Choose one evidence card below as the anchor before drafting. Inspect its finished media, then state which traits will be preserved, replaced, and avoided. A title match alone is not evidence.

### E1 · AntiGravity + Gemini 3.1 落地页

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/antigravity-gemini-3-1-5e49aad75b25) · [finished media](https://video.twimg.com/amplify_video/2024831377322160128/vid/avc1/2354x1720/XnHdS5oKAr0D6Lpn.mp4?tag=21) · [poster](https://pbs.twimg.com/amplify_video_thumb/2024831377322160128/img/tL5r3ZGkPZiF3Wwd.jpg) · [original source](https://x.com/viktoroddy/status/2024832167164133766)
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

### E2 · ChatGPT Image 设计转 React Native 网站

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/chatgpt-image-react-native-3042b25ce192) · [finished media](https://video.twimg.com/amplify_video/2059293319994458113/vid/avc1/1902x1350/h9ABBWI075C9Pp83.mp4?tag=27) · [poster](https://pbs.twimg.com/amplify_video_thumb/2059293319994458113/img/rFxlPRkHO5m-zMYy.jpg) · [original source](https://x.com/viktoroddy/status/2059294558299766837)
- Summary: @viktoroddy 使用 ChatGPT Image 2.0 · Claude Opus 4.6完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Access ALL prompts for stunning animated websites in one click:
>
> EXACT RECREATION PROMPT
>
> Project Setup
>
> Stack: React 19 + Vite 6 + Tailwind CSS 4 + Motion (Framer Motion) + Lucide React icons + TypeScript
>
> package.json dependencies:
> - `react`, `react-dom` ^19.0.1
> - `vite` ^6.2.3
> - `@tailwindcss/vite` ^4.1.14, `tailwindcss` ^4.1.14
> - `motion` ^12.23.24
> - `lucide-react` ^0.546.0
> - `@vitejs/plugin-react` ^5.0.4
> - `typescript` ~5.8.2
>
> Fonts (loaded via Google Fonts in `index.css`):
> - Sans: Inter (weights: 300, 400, 500, 600)
> - Mono: JetBrains Mono (weights: 400, 500)
>
> ```css
> /* index.css */
> @import url('');
> @import "tailwindcss";
>
> @theme {
>   --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
>   --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
> }
>
> @layer utilities {
>   .text-mega {
>     font-size: 21vw;
>     line-height: 0.75;
>     letter-spacing: -0.04em;
>   }
> }
> ```
>
> Global styling: Background `#fcfcfc`, text `#111`, selection color `bg-black text-white`, `overflow-x-hidden`, `font-sans` (Inter).
>
> ---
>
> DATA
>
> ```tsx
> const chaptersData = [
>   { name: "Age of Dinosaurs", image: "" },
>   { name: "Fossils of Ancient Life", image: "" },
>   { name: "Reptiles of the Mesozoic", image: "" },
>   { name: "Marine Fossil Gallery", image: "" },
>   { name: "Prehistoric Giants", image: "" }
> ];
> ```
>
> ---
>
> STATE
>
> ```tsx
> const [showVideo, setShowVideo] = useState(false);
> const [activeChapter, setActiveChapter] = useState(2); // starts at "Reptiles of the Mesozoic"
> const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
> ```
>
> - `showVideo` flips to `true` after a 2800m…

### E3 · Claude 自动生成单页动效站

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

### E4 · Claude + Fable：Aethera Fintech 落地页

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/claude-fable-aethera-fintech-42f59ca99541) · [finished media](https://video.twimg.com/amplify_video/2077365692027060224/vid/avc1/2972x2160/6rwwwebHlulfYW9W.mp4?tag=28) · [poster](https://pbs.twimg.com/amplify_video_thumb/2077365692027060224/img/1aEX0t3Qp5zPc6Hc.jpg) · [original source](https://x.com/viktoroddy/status/2077366050828751274)
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

### E5 · Claude + Nano Banana + Kling 动画网站

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

### E6 · Gemini 3.1 一次生成动效网站

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

### E7 · Gemini + AntiGravity 牙科诊所网站

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/gemini-antigravity-87b7fea47629) · [finished media](https://video.twimg.com/amplify_video/2070427586120048640/vid/avc1/3256x2160/fce0nXyCO_sMJiTX.mp4?tag=28) · [poster](https://pbs.twimg.com/amplify_video_thumb/2070427586120048640/img/bK8ce29Ow34r9aXx.jpg) · [original source](https://x.com/viktoroddy/status/2070428537790877738)
- Summary: @viktoroddy 使用 Gemini · AntiGravity · React完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> This design was submited by Nixtio Agency.
>
> Access ALL prompts for stunning animated websites in one click:
>
> ---
>
> ## PROMPT: Recreate Dental Health Landing Page
>
> Create a single-page dental clinic landing page using **React + Vite + TypeScript + Tailwind CSS**. No external UI libraries, no icon libraries. Everything lives in one `App.tsx` file. The page has 3 full-screen sections, a splash screen, and a fixed navbar.
>
> ---
>
> ### SETUP
>
> **Font:** "Open Sauce One" loaded via these exact links in `index.html` `<head>`:
> ```html
> <link href="" rel="stylesheet">
> <link href="" rel="stylesheet">
> ```
>
> **Title:** "Dental Health - Quality Healthcare"
>
> **Global CSS (index.css):**
> ```css
> @tailwind base;
> @tailwind components;
> @tailwind utilities;
>
> @layer base {
> html, body, #root {
> height: 100%;
> margin: 0;
> padding: 0;
> }
> body {
> font-family: 'Open Sauce One', -apple-system, BlinkMacSystemFont, sans-serif;
> -webkit-font-smoothing: antialiased;
> -moz-osx-font-smoothing: grayscale;
> }
> }
> ```
>
> **Tailwind config:** Default, no extensions. Content: `['./index.html', './src/**/*.{js,ts,jsx,tsx}']`.
>
> ---
>
> ### IMAGE URLS (use these EXACT URLs)
>
> ```ts
> const HERO_IMAGE = '';
>
> const SECTION2_IMAGE = '';
>
> const SECTION3_IMG1 = '';
>
> const SECTION3_IMG2 = '';
>
> const SECTION3_BG = '';
> ```
>
> ---
>
> ### DATA CONSTANTS
>
> ```ts
> const featureBars = ['Advanced Dentistry', 'High Quality Equipment', 'Friendly Staff'];
>
> const services = [
> { name: 'Dental\nVeneers', num: '01', active: true },
> { name: 'Dental\nCrowns', num: '02', active: false },
> { name: 'Teeth\nWhitening', num: '03', active: false },
> { name: 'Dental\nImplants…

### E8 · Gemini vs Claude：Velorah 电动房车落地页

- Creator: @viktoroddy
- Evidence: [GoodCase](https://goodcase.ai/cases/gemini-vs-claude-velorah-1f09726b10d6) · [finished media](https://video.twimg.com/amplify_video/2038563844654804992/vid/avc1/1384x1680/2UZzyXPTOiq1X1JR.mp4?tag=21) · [poster](https://pbs.twimg.com/amplify_video_thumb/2038563844654804992/img/ALrYr9fi-uBaZWKp.jpg) · [original source](https://x.com/viktoroddy/status/2038564207101436210)
- Summary: @viktoroddy 使用 Gemini · Claude完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Access ALL prompts for stunning animated websites in one click:
>
> Build a Velorah landing page -- a premium, dark-themed single-page site for an electric RV/camper brand. Use React, TypeScript, Tailwind CSS, and the hls.js library. The page has 6 sections stacked vertically. The entire page background is pure black (hsl(0,0%,0%)). Use the font Instrument Serif (loaded from Google Fonts via <link> in index.html) for all headings and display text, and Inter for body text.
>
> GLOBAL STYLES (index.css):
>
> Import Google Fonts at the top:
>
> @import url('');
> CSS custom properties (dark-only, no light mode):
>
> --background: 201 100% 13%
> --foreground: 0 0% 100% (white)
> --card: 0 0% 6%
> --card-foreground: 0 0% 100%
> --primary: 0 0% 100%
> --primary-foreground: 0 0% 4%
> --secondary: 0 0% 10%
> --secondary-foreground: 0 0% 100%
> --muted: 0 0% 10%
> --muted-foreground: 240 4% 66%
> --accent: 0 0% 10%
> --accent-foreground: 0 0% 100%
> --destructive: 0 84.2% 60.2%
> --destructive-foreground: 0 0% 100%
> --border: 0 0% 18%
> --input: 0 0% 18%
> --ring: 0 0% 100%
> --radius: 0.5rem
> Body uses font-family: var(--font-body) which maps to Inter.
>
> Liquid Glass CSS class (.liquid-glass):
>
> background: rgba(255, 255, 255, 0.01) with background-blend-mode: luminosity
> backdrop-filter: blur(4px) and -webkit-backdrop-filter: blur(4px)
> border: none
> box-shadow: inset 0 1px 1px rgba(255,255,255,0.1)
> position: relative; overflow: hidden
> ::before pseudo-element creates a gradient border effect:
> padding: 1.4px
> background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,…

## Evidence index

| Case | Creator | GoodCase evidence | Finished media | Original source | Card |
| --- | --- | --- | --- | --- | --- |
| AntiGravity + Gemini 3.1 落地页 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/antigravity-gemini-3-1-5e49aad75b25) | [Media](https://video.twimg.com/amplify_video/2024831377322160128/vid/avc1/2354x1720/XnHdS5oKAr0D6Lpn.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2024832167164133766) | E1 |
| ChatGPT Image 设计转 React Native 网站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/chatgpt-image-react-native-3042b25ce192) | [Media](https://video.twimg.com/amplify_video/2059293319994458113/vid/avc1/1902x1350/h9ABBWI075C9Pp83.mp4?tag=27) | [Original](https://x.com/viktoroddy/status/2059294558299766837) | E2 |
| Claude 自动生成单页动效站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/claude-53a17a454214) | [Media](https://video.twimg.com/ext_tw_video/2040894830901858304/pu/vid/avc1/720x1272/a_aUMCoAo2TC-1Io.mp4?tag=12) | [Original](https://x.com/viktoroddy/status/2040894867153338643) | E3 |
| Claude + Fable：Aethera Fintech 落地页 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/claude-fable-aethera-fintech-42f59ca99541) | [Media](https://video.twimg.com/amplify_video/2077365692027060224/vid/avc1/2972x2160/6rwwwebHlulfYW9W.mp4?tag=28) | [Original](https://x.com/viktoroddy/status/2077366050828751274) | E4 |
| Claude + Nano Banana + Kling 动画网站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/claude-nano-banana-kling-37787d8ec68d) | [Media](https://video.twimg.com/amplify_video/2042188295376179200/vid/avc1/1526x1728/uT80dVqvhGdiDYq5.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2042188738818957631) | E5 |
| Gemini 3.1 一次生成动效网站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/gemini-3-1-65cd001c4cd3) | [Media](https://video.twimg.com/amplify_video/2026249412696297473/vid/avc1/1440x1080/R9hPUCWRnhz8ybRp.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2026249809506811965) | E6 |
| Gemini + AntiGravity 牙科诊所网站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/gemini-antigravity-87b7fea47629) | [Media](https://video.twimg.com/amplify_video/2070427586120048640/vid/avc1/3256x2160/fce0nXyCO_sMJiTX.mp4?tag=28) | [Original](https://x.com/viktoroddy/status/2070428537790877738) | E7 |
| Gemini vs Claude：Velorah 电动房车落地页 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/gemini-vs-claude-velorah-1f09726b10d6) | [Media](https://video.twimg.com/amplify_video/2038563844654804992/vid/avc1/1384x1680/2UZzyXPTOiq1X1JR.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2038564207101436210) | E8 |
| Google Stitch 对比 Claude 网页生成 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/google-stitch-claude-9c762b56d629) | [Media](https://video.twimg.com/amplify_video/2036062856282865664/vid/avc1/1388x1676/qg8Ye5QaOA7DIaRM.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2036138516070146225) | E— |
| Nano Banana + Flow + AntiGravity 动效网站 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/nano-banana-flow-antigravity-423c21fb568e) | [Media](https://video.twimg.com/amplify_video/2027664570060550145/vid/avc1/1520x1080/-9gPPS697Zzh7MLK.mp4?tag=21) | [Original](https://x.com/viktoroddy/status/2027664654252839271) | E— |

## Derivation boundary

- Inclusion means the published Case matched the method pattern; it does not prove the creator used this exact synthesized workflow.
- Popularity is not part of the Skill threshold.
- Treat GoodCase summaries as editorial evidence and the linked original source as primary evidence.
