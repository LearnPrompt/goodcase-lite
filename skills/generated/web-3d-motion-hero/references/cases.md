# Case evidence

This workflow is derived from 165 published Cases across 29 creators.

## Operating rule

Choose one evidence card below as the anchor before drafting. Inspect its finished media, then state which traits will be preserved, replaced, and avoided. A title match alone is not evidence.

### E1 · 3D 超市包装式创意机构官网

- Creator: @Oluwaphilemon1
- Evidence: [GoodCase](https://goodcase.ai/cases/3d-8bbc2b408223) · [finished media](https://media.goodcase.ai/media/video/3d-8bbc2b408223.mp4) · [poster](https://media.goodcase.ai/media/poster/3d-8bbc2b408223.jpg) · [original source](https://x.com/Oluwaphilemon1/status/2068957493561045032)
- Summary: @Oluwaphilemon1 使用 Claude Fable 5 · Three.js · Blender · GSAP完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Claude Fable 5 and GPT-5.6 are powerful🥵🥵🥵
>
> Here Is How I built with Claude 👇
>
> Prompt: "Design an agency site where services are presented as supermarket product packaging in 3D"
>
> Use Three.js with WebGL to render all products in real time in the browser
>
> Use Blender to model the packaging then export as GLTF to load in Three.js
>
> Use GSAP for the smooth product rotation and hover interactions
>
> Save this if you want a portfolio that makes clients feel they are buying something premium 🛒

### E2 · 3D Animated Pin

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/3d-animated-pin) · [finished media](https://media.goodcase.ai/cases/0b778c9ee5bc.mp4) · [poster](https://media.goodcase.ai/cases/8195c4300c24.webp) · [original source](https://ui.aceternity.com/components/3d-pin)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「3D Animated Pin」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/3d-pin.tsx
> "use client";
> import React, { useState } from "react";
> import { motion } from "motion/react";
> import { cn } from "@/lib/utils";
>
>
> export const PinContainer = ({
>   children,
>   title,
>   href,
>   className,
>   containerClassName,
> }: {
>   children: React.ReactNode;
>   title?: string;
>   href?: string;
>   className?: string;
>   containerClassName?: string;
> }) => {
>   const [transform, setTransform] = useState(
>     "translate(-50%,-50%) rotateX(0deg)"
>   );
>
>   const onMouseEnter = () => {
>     setTransform("translate(-50%,-50%) rotateX(40deg) scale(0.8)");
>   };
>   const onMouseLeave = () => {
>     setTransform("translate(-50%,-50%) rotateX(0deg) scale(1)");
>   };
>
>   return (
>     <a
>       className={cn(
>         "relative group/pin z-50  cursor-pointer",
>         containerClassName
>       )}
>       onMouseEnter={onMouseEnter}
>       onMouseLeave={onMouseLeave}
>       href={href || "/"}
>     >
>       <div
>         style={{
>           perspective: "1000px",
>           transform: "rotateX(70deg) translateZ(0deg)",
>         }}
>         className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
>       >
>         <div
>           style={{
>             transform: transform,
>           }}
>           className="absolute left-1/2 p-4 top-1/2  flex justify-start items-start  rounded-2xl  shadow-[0_8px_16px_rgb(0_0_0/0.4)] bg-black border border-white/[0.1] group-hover/pin:border-white/[0.2] transition duration-700 overflow-hidden"
>         >
>           <div className={cn(" relative z-50 ", className)}>{children}</div>
>         </div>
>       </div>
>       <PinPerspecti…

### E3 · 3D Globe

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/3d-globe) · [finished media](https://media.goodcase.ai/cases/c98bbb728b7b.webp) · [original source](https://ui.aceternity.com/components/3d-globe)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「3D Globe」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/3d-globe.tsx
> "use client";
> import React, { useRef, useMemo, useState, useCallback, Suspense } from "react";
> import { Canvas, useFrame, useThree } from "@react-three/fiber";
> import { OrbitControls, Html, useTexture } from "@react-three/drei";
> import * as THREE from "three";
> import { cn } from "@/lib/utils";
>
> // ============================================================================
> // Types
> // ============================================================================
>
> export interface GlobeMarker {
>   lat: number;
>   lng: number;
>   src: string;
>   label?: string;
>   size?: number;
> }
>
> export interface Globe3DConfig {
>   /** Globe radius */
>   radius?: number;
>   /** Globe base color (used as fallback or tint) */
>   globeColor?: string;
>   /** URL to the Earth texture map */
>   textureUrl?: string;
>   /** URL to the bump/elevation map for terrain */
>   bumpMapUrl?: string;
>   /** Whether to show atmosphere glow */
>   showAtmosphere?: boolean;
>   /** Atmosphere color */
>   atmosphereColor?: string;
>   /** Atmosphere intensity */
>   atmosphereIntensity?: number;
>   /** Atmosphere blur/softness (higher = more diffuse, default 3) */
>   atmosphereBlur?: number;
>   /** Terrain bump scale (0 = flat, higher = more pronounced) */
>   bumpScale?: number;
>   /** Auto rotate speed (0 = disabled) */
>   autoRotateSpeed?: number;
>   /** Enable zoom */
>   enableZoom?: boolean;
>   /** Enable pan */
>   enablePan?: boolean;
>   /** Min zoom distance */
>   minDistance?: number;
>   /** Max zoom distance */
>   maxDistance?: number;
>   /** Initial rotation */
>   initialRotation?: { x: number; y: number };
>   /**…

### E4 · 3D Jack Portfolio

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

### E5 · 3D Marquee

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/3d-marquee) · [finished media](https://media.goodcase.ai/cases/725a48f190ff.webp) · [original source](https://ui.aceternity.com/components/3d-marquee)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「3D Marquee」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/3d-marquee.tsx
> "use client";
>
> import { motion } from "motion/react";
> import { cn } from "@/lib/utils";
> export const ThreeDMarquee = ({
>   images,
>   className,
> }: {
>   images: string[];
>   className?: string;
> }) => {
>   // Split the images array into 4 equal parts
>   const chunkSize = Math.ceil(images.length / 4);
>   const chunks = Array.from({ length: 4 }, (_, colIndex) => {
>     const start = colIndex * chunkSize;
>     return images.slice(start, start + chunkSize);
>   });
>   return (
>     <div
>       className={cn(
>         "mx-auto block h-[600px] overflow-hidden rounded-2xl max-sm:h-100",
>         className,
>       )}
>     >
>       <div className="flex size-full items-center justify-center">
>         <div className="size-[1720px] shrink-0 scale-50 sm:scale-75 lg:scale-100">
>           <div
>             style={{
>               transform: "rotateX(55deg) rotateY(0deg) rotateZ(-45deg)",
>             }}
>             className="relative top-96 right-[50%] grid size-full origin-top-left grid-cols-4 gap-8 transform-3d"
>           >
>             {chunks.map((subarray, colIndex) => (
>               <motion.div
>                 animate={{ y: colIndex % 2 === 0 ? 100 : -100 }}
>                 transition={{
>                   duration: colIndex % 2 === 0 ? 10 : 15,
>                   repeat: Infinity,
>                   repeatType: "reverse",
>                 }}
>                 key={colIndex + "marquee"}
>                 className="flex flex-col items-start gap-8"
>               >
>                 <GridLineVertical className="-left-4" offset="80px" />
>                 {subarray.map((image, imageIndex…

### E6 · 3D 发票打印机 SaaS 组件

- Creator: @uxsweta
- Evidence: [GoodCase](https://goodcase.ai/cases/3d-saas-2b0c021f6a2f) · [finished media](https://media.goodcase.ai/media/video/3d-saas-2b0c021f6a2f.mp4) · [poster](https://media.goodcase.ai/media/poster/3d-saas-2b0c021f6a2f.jpg) · [original source](https://x.com/uxsweta/status/2061334430103535727)
- Summary: @uxsweta 使用 AI UI Builder完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Few people asked for the prompt, so here it is 👇
>
> PS: Tweak it based on your use case.
>
> Create a modern, minimal 3D Invoice Generator Machine component with a premium SaaS-style aesthetic.
>
> Visual Design
>
> - Design a wide, horizontal invoice printing machine inspired by receipt printers, but with a futuristic and clean appearance.
> - Use subtle gray strokes, soft shadows, and minimal details.
> - The machine should feel premium, lightweight, and modern rather than realistic or industrial.
> - Keep the overall design clean enough to fit inside a dashboard or landing page hero section.
> - Add a single prominent "Print Invoice" button directly on the machine.
>
> Animation
>
> When the user clicks the "Print Invoice" button:
>
> - The machine should react with a subtle press/click animation.
> - A receipt should gradually emerge from the printer slot.
> - The receipt must animate smoothly from inside the machine to outside, giving the impression that it is being physically printed.
> - The animation should feel realistic, fluid, and satisfying.
> - The receipt should slide out line-by-line rather than appearing instantly.
> - Add slight motion easing and subtle paper movement for realism.
>
> Receipt Design
>
> The receipt should remain highly minimal and editable.
>
> Do NOT fill it with complex customer information.
>
> Use placeholder content such as:
>
> Customer Name
>
> Product
>
> Total Amount
>
> The receipt should look like a clean invoice preview rather than a detailed bill.
>
> Interaction
>
> - The receipt should be hidden initially.
> - It should only appear after clicking the Print Invoice button.
> - The animation shoul…

### E7 · Agent Wave

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

### E8 · AI Workflow Hero

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

## Evidence index

| Case | Creator | GoodCase evidence | Finished media | Original source | Card |
| --- | --- | --- | --- | --- | --- |
| 3D 超市包装式创意机构官网 | @Oluwaphilemon1 | [GoodCase](https://goodcase.ai/cases/3d-8bbc2b408223) | [Media](https://media.goodcase.ai/media/video/3d-8bbc2b408223.mp4) | [Original](https://x.com/Oluwaphilemon1/status/2068957493561045032) | E1 |
| 3D Animated Pin | Aceternity UI | [GoodCase](https://goodcase.ai/cases/3d-animated-pin) | [Media](https://media.goodcase.ai/cases/0b778c9ee5bc.mp4) | [Original](https://ui.aceternity.com/components/3d-pin) | E2 |
| 3D Globe | Aceternity UI | [GoodCase](https://goodcase.ai/cases/3d-globe) | [Media](https://media.goodcase.ai/cases/c98bbb728b7b.webp) | [Original](https://ui.aceternity.com/components/3d-globe) | E3 |
| 3D Jack Portfolio | MotionSites | [GoodCase](https://goodcase.ai/cases/3d-jack-portfolio) | [Media](https://media.goodcase.ai/cases/49f8aeaa5fab.mp4) | [Original](https://motionsites.ai/?prompt=3d-jack-portfolio-hero) | E4 |
| 3D Marquee | Aceternity UI | [GoodCase](https://goodcase.ai/cases/3d-marquee) | [Media](https://media.goodcase.ai/cases/725a48f190ff.webp) | [Original](https://ui.aceternity.com/components/3d-marquee) | E5 |
| 3D 发票打印机 SaaS 组件 | @uxsweta | [GoodCase](https://goodcase.ai/cases/3d-saas-2b0c021f6a2f) | [Media](https://media.goodcase.ai/media/video/3d-saas-2b0c021f6a2f.mp4) | [Original](https://x.com/uxsweta/status/2061334430103535727) | E6 |
| Agent Wave | MotionSites | [GoodCase](https://goodcase.ai/cases/agent-wave) | [Media](https://media.goodcase.ai/cases/ae8afbd1c466.mp4) | [Original](https://motionsites.ai/?prompt=agent-wave) | E7 |
| AI Workflow Hero | MotionSites | [GoodCase](https://goodcase.ai/cases/ai-workflow-hero) | [Media](https://media.goodcase.ai/cases/9e51fe5b57ba.webp) | [Original](https://motionsites.ai/?prompt=ai-workflow) | E8 |
| Animated Cards | MotionSites | [GoodCase](https://goodcase.ai/cases/animated-cards) | [Media](https://media.goodcase.ai/cases/9cacdc3c42fa.webp) | [Original](https://motionsites.ai/?prompt=animated-cards) | E— |
| Animated Modal | Aceternity UI | [GoodCase](https://goodcase.ai/cases/animated-modal) | [Media](https://media.goodcase.ai/cases/89e7955c1676.webp) | [Original](https://ui.aceternity.com/components/animated-modal) | E— |
| Animated Tabs | Aceternity UI | [GoodCase](https://goodcase.ai/cases/animated-tabs) | [Media](https://media.goodcase.ai/cases/ee1949cbe51d.mp4) | [Original](https://ui.aceternity.com/components/tabs) | E— |
| Animated Testimonials | Aceternity UI | [GoodCase](https://goodcase.ai/cases/animated-testimonials) | [Media](https://media.goodcase.ai/cases/92c8376dba8b.webp) | [Original](https://ui.aceternity.com/components/animated-testimonials) | E— |
| Animated Tooltip | Aceternity UI | [GoodCase](https://goodcase.ai/cases/animated-tooltip) | [Media](https://media.goodcase.ai/cases/b577a1f54d3a.mov) | [Original](https://ui.aceternity.com/components/animated-tooltip) | E— |
| AntiGravity + Gemini 3.1 落地页 | @viktoroddy | [GoodCase](https://goodcase.ai/cases/antigravity-gemini-3-1-5e49aad75b25) | [Media](https://media.goodcase.ai/media/video/antigravity-gemini-3-1-5e49aad75b25.mp4) | [Original](https://x.com/viktoroddy/status/2024832167164133766) | E— |
| Apple Cards Carousel | Aceternity UI | [GoodCase](https://goodcase.ai/cases/apple-cards-carousel) | [Media](https://media.goodcase.ai/cases/1a0c96a64741.webp) | [Original](https://ui.aceternity.com/components/apple-cards-carousel) | E— |
| ASCII Art | Aceternity UI | [GoodCase](https://goodcase.ai/cases/ascii-art) | [Media](https://media.goodcase.ai/cases/cc7e5f4e02f0.webp) | [Original](https://ui.aceternity.com/components/ascii-art) | E— |
| Aurora Background | Aceternity UI | [GoodCase](https://goodcase.ai/cases/aurora-background) | [Media](https://media.goodcase.ai/cases/f5af773675b0.webp) | [Original](https://ui.aceternity.com/components/aurora-background) | E— |
| Aurora Onboard | MotionSites | [GoodCase](https://goodcase.ai/cases/aurora-onboard) | [Media](https://media.goodcase.ai/cases/2f00c494a458.png) | [Original](https://motionsites.ai/?prompt=aurora-onboard) | E— |
| Background Beams | Aceternity UI | [GoodCase](https://goodcase.ai/cases/background-beams) | [Media](https://media.goodcase.ai/cases/6282a2b80eb8.mov) | [Original](https://ui.aceternity.com/components/background-beams) | E— |
| Background Beams With Collision | Aceternity UI | [GoodCase](https://goodcase.ai/cases/background-beams-with-collision) | [Media](https://media.goodcase.ai/cases/4ad007e64c9e.webp) | [Original](https://ui.aceternity.com/components/background-beams-with-collision) | E— |

## Derivation boundary

- Inclusion means the published Case matched the method pattern; it does not prove the creator used this exact synthesized workflow.
- Popularity is not part of the Skill threshold.
- Treat GoodCase summaries as editorial evidence and the linked original source as primary evidence.
