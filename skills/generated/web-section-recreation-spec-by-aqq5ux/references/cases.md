# Case evidence

This is an unofficial synthesis of a recurring method found in 7 published Cases attributed to Aceternity UI. It is not an official Skill from that creator.

## Operating rule

Choose one evidence card below as the anchor before drafting. Inspect its finished media, then state which traits will be preserved, replaced, and avoided. A title match alone is not evidence.

### E1 · Direction Aware Hover

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/direction-aware-hover) · [finished media](https://media.goodcase.ai/cases/b8b986c47f85.webp) · [original source](https://ui.aceternity.com/components/direction-aware-hover)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Direction Aware Hover」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/direction-aware-hover.tsx
> "use client";
>
> import { useRef, useState } from "react";
>
> import { AnimatePresence, motion } from "motion/react";
> import { cn } from "@/lib/utils";
>
> export const DirectionAwareHover = ({
>   imageUrl,
>   children,
>   childrenClassName,
>   imageClassName,
>   className,
> }: {
>   imageUrl: string;
>   children: React.ReactNode | string;
>   childrenClassName?: string;
>   imageClassName?: string;
>   className?: string;
> }) => {
>   const ref = useRef<HTMLDivElement>(null);
>
>   const [direction, setDirection] = useState<
>     "top" | "bottom" | "left" | "right" | string
>   >("left");
>
>   const handleMouseEnter = (
>     event: React.MouseEvent<HTMLDivElement, MouseEvent>
>   ) => {
>     if (!ref.current) return;
>
>     const direction = getDirection(event, ref.current);
>     console.log("direction", direction);
>     switch (direction) {
>       case 0:
>         setDirection("top");
>         break;
>       case 1:
>         setDirection("right");
>         break;
>       case 2:
>         setDirection("bottom");
>         break;
>       case 3:
>         setDirection("left");
>         break;
>       default:
>         setDirection("left");
>         break;
>     }
>   };
>
>   const getDirection = (
>     ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
>     obj: HTMLElement
>   ) => {
>     const { width: w, height: h, left, top } = obj.getBoundingClientRect();
>     const x = ev.clientX - left - (w / 2) * (w > h ? h / w : 1);
>     const y = ev.clientY - top - (h / 2) * (h > w ? w / h : 1);
>     const d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
>     return d;
>   };
>
>   return (
>     <motion.div
>       o…

### E2 · Hero Highlight

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/hero-highlight) · [finished media](https://media.goodcase.ai/cases/55b88bf3221d.webp) · [original source](https://ui.aceternity.com/components/hero-highlight)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Hero Highlight」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/hero-highlight.tsx
> "use client";
> import { cn } from "@/lib/utils";
> import { useMotionValue, motion, useMotionTemplate } from "motion/react";
> import React from "react";
>
> export const HeroHighlight = ({
>   children,
>   className,
>   containerClassName,
> }: {
>   children: React.ReactNode;
>   className?: string;
>   containerClassName?: string;
> }) => {
>   let mouseX = useMotionValue(0);
>   let mouseY = useMotionValue(0);
>
>   // SVG patterns for different states and themes
>   const dotPatterns = {
>     light: {
>       default: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%23d4d4d4' id='pattern-circle' cx='10' cy='10' r='2.5'%3E%3C/circle%3E%3C/svg%3E")`,
>       hover: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%236366f1' id='pattern-circle' cx='10' cy='10' r='2.5'%3E%3C/circle%3E%3C/svg%3E")`,
>     },
>     dark: {
>       default: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%23404040' id='pattern-circle' cx='10' cy='10' r='2.5'%3E%3C/circle%3E%3C/svg%3E")`,
>       hover: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%238183f4' id='pattern-circle' cx='10' cy='10' r='2.5'%3E%3C/circle%3E%3C/svg%3E")`,
>     },
>   };
>
>   function handleMouseMove({
>     current…

### E3 · Hero Parallax

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/hero-parallax) · [finished media](https://media.goodcase.ai/cases/97c62955961f.webp) · [original source](https://ui.aceternity.com/components/hero-parallax)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Hero Parallax」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/hero-parallax.tsx
> "use client";
> import React from "react";
> import {
>   motion,
>   useScroll,
>   useTransform,
>   useSpring,
>   MotionValue,
> } from "motion/react";
>
>
>
> export const HeroParallax = ({
>   products,
> }: {
>   products: {
>     title: string;
>     link: string;
>     thumbnail: string;
>   }[];
> }) => {
>   const firstRow = products.slice(0, 5);
>   const secondRow = products.slice(5, 10);
>   const thirdRow = products.slice(10, 15);
>   const ref = React.useRef(null);
>   const { scrollYProgress } = useScroll({
>     target: ref,
>     offset: ["start start", "end start"],
>   });
>
>   const springConfig = { stiffness: 300, damping: 30, bounce: 100 };
>
>   const translateX = useSpring(
>     useTransform(scrollYProgress, [0, 1], [0, 1000]),
>     springConfig
>   );
>   const translateXReverse = useSpring(
>     useTransform(scrollYProgress, [0, 1], [0, -1000]),
>     springConfig
>   );
>   const rotateX = useSpring(
>     useTransform(scrollYProgress, [0, 0.2], [15, 0]),
>     springConfig
>   );
>   const opacity = useSpring(
>     useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
>     springConfig
>   );
>   const rotateZ = useSpring(
>     useTransform(scrollYProgress, [0, 0.2], [20, 0]),
>     springConfig
>   );
>   const translateY = useSpring(
>     useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
>     springConfig
>   );
>   return (
>     <div
>       ref={ref}
>       className="h-[300vh] py-40 overflow-hidden  antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
>     >
>       <Header />
>       <motion.div
>         style={{
>           rotateX,
>           rotateZ,
>           trans…

### E4 · Hover Border Gradient

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/hover-border-gradient) · [finished media](https://media.goodcase.ai/cases/7240e9526189.webp) · [original source](https://ui.aceternity.com/components/hover-border-gradient)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Hover Border Gradient」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/hover-border-gradient.tsx
> "use client";
> import React, { useState, useEffect, useRef } from "react";
>
> import { motion } from "motion/react";
> import { cn } from "@/lib/utils";
>
> type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";
>
> export function HoverBorderGradient({
>   children,
>   containerClassName,
>   className,
>   as: Tag = "button",
>   duration = 1,
>   clockwise = true,
>   ...props
> }: React.PropsWithChildren<
>   {
>     as?: React.ElementType;
>     containerClassName?: string;
>     className?: string;
>     duration?: number;
>     clockwise?: boolean;
>   } & React.HTMLAttributes<HTMLElement>
> >) {
>   const [hovered, setHovered] = useState<boolean>(false);
>   const [direction, setDirection] = useState<Direction>("TOP");
>
>   const rotateDirection = (currentDirection: Direction): Direction => {
>     const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
>     const currentIndex = directions.indexOf(currentDirection);
>     const nextIndex = clockwise
>       ? (currentIndex - 1 + directions.length) % directions.length
>       : (currentIndex + 1) % directions.length;
>     return directions[nextIndex];
>   };
>
>   const movingMap: Record<Direction, string> = {
>     TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
>     LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
>     BOTTOM:
>       "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
>     RIGHT:
>       "radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255…

### E5 · Hover Effect

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/hover-effect) · [finished media](https://media.goodcase.ai/cases/7a472bb004f7.webp) · [original source](https://ui.aceternity.com/components/card-hover-effect)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Hover Effect」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/card-hover-effect.tsx
> import { cn } from "@/lib/utils";
> import { AnimatePresence, motion } from "motion/react";
>
> import { useState } from "react";
>
> export const HoverEffect = ({
>   items,
>   className,
> }: {
>   items: {
>     title: string;
>     description: string;
>     link: string;
>   }[];
>   className?: string;
> }) => {
>   let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
>
>   return (
>     <div
>       className={cn(
>         "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3  py-10",
>         className
>       )}
>     >
>       {items.map((item, idx) => (
>         <a
>           href={item?.link}
>           key={item?.link}
>           className="relative group  block p-2 h-full w-full"
>           onMouseEnter={() => setHoveredIndex(idx)}
>           onMouseLeave={() => setHoveredIndex(null)}
>         >
>           <AnimatePresence>
>             {hoveredIndex === idx && (
>               <motion.span
>                 className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block  rounded-3xl"
>                 layoutId="hoverBackground"
>                 initial={{ opacity: 0 }}
>                 animate={{
>                   opacity: 1,
>                   transition: { duration: 0.15 },
>                 }}
>                 exit={{
>                   opacity: 0,
>                   transition: { duration: 0.15, delay: 0.2 },
>                 }}
>               />
>             )}
>           </AnimatePresence>
>           <Card>
>             <CardTitle>{item.title}</CardTitle>
>             <CardDescription>{item.description}</CardDescription>
>           </Card>
>         </a>…

### E6 · Parallax Hero Images

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/parallax-hero-images) · [finished media](https://media.goodcase.ai/cases/680ae6c86288.webp) · [original source](https://ui.aceternity.com/components/parallax-hero-images)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Parallax Hero Images」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/parallax-hero-images.tsx
> "use client";
> import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
> import {
>   motion,
>   useMotionValue,
>   useSpring,
>   useTransform,
>   MotionValue,
> } from "motion/react";
> import { cn } from "@/lib/utils";
>
> type ImagePosition = {
>   src: string;
>   position:
>     | "top-left"
>     | "top-right"
>     | "mid-left"
>     | "mid-right"
>     | "bottom-left"
>     | "bottom-right"
>     | "far-left"
>     | "far-right";
>   depth: number;
>   delay: number;
> };
>
> const positionStyles: Record<
>   ImagePosition["position"],
>   { top: string; left?: string; right?: string }
> > = {
>   "top-left": { top: "8%", left: "4%" },
>   "top-right": { top: "8%", right: "4%" },
>   "mid-left": { top: "38%", left: "6%" },
>   "mid-right": { top: "38%", right: "6%" },
>   "bottom-left": { top: "68%", left: "4%" },
>   "bottom-right": { top: "68%", right: "4%" },
>   "far-left": { top: "52%", left: "2%" },
>   "far-right": { top: "52%", right: "2%" },
> };
>
> const positionOrder: ImagePosition["position"][] = [
>   "top-left",
>   "top-right",
>   "mid-left",
>   "mid-right",
>   "bottom-left",
>   "bottom-right",
>   "far-left",
>   "far-right",
> ];
>
> type DepthVariant = "default" | "edge-focus";
>
> const depthValuesByVariant: Record<DepthVariant, number[]> = {
>   default: [0.3, 0.35, 0.9, 0.85, 0.4, 0.45, 0.25, 0.2],
>   "edge-focus": [0.85, 0.9, 0.3, 0.35, 0.8, 0.85, 0.4, 0.45],
> };
>
> const SPRING_CONFIG = { damping: 25, stiffness: 120 };
>
> export interface ParallaxHeroImagesProps {
>   images: string[];
>   className?: string;
>   imageClassName?: string;
>   variant?: DepthVariant;
> }
>
> export const Pa…

### E7 · Text Hover Effect

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/text-hover-effect) · [finished media](https://media.goodcase.ai/cases/48686f539bc0.webp) · [original source](https://ui.aceternity.com/components/text-hover-effect)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Text Hover Effect」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/text-hover-effect.tsx
> "use client";
> import React, { useRef, useEffect, useState } from "react";
> import { motion } from "motion/react";
>
> export const TextHoverEffect = ({
>   text,
>   duration,
> }: {
>   text: string;
>   duration?: number;
>   automatic?: boolean;
> }) => {
>   const svgRef = useRef<SVGSVGElement>(null);
>   const [cursor, setCursor] = useState({ x: 0, y: 0 });
>   const [hovered, setHovered] = useState(false);
>   const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
>
>   useEffect(() => {
>     if (svgRef.current && cursor.x !== null && cursor.y !== null) {
>       const svgRect = svgRef.current.getBoundingClientRect();
>       const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
>       const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
>       setMaskPosition({
>         cx: `${cxPercentage}%`,
>         cy: `${cyPercentage}%`,
>       });
>     }
>   }, [cursor]);
>
>   return (
>     <svg
>       ref={svgRef}
>       width="100%"
>       height="100%"
>       viewBox="0 0 300 100"
>       xmlns="http://www.w3.org/2000/svg"
>       onMouseEnter={() => setHovered(true)}
>       onMouseLeave={() => setHovered(false)}
>       onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
>       className="select-none"
>     >
>       <defs>
>         <linearGradient
>           id="textGradient"
>           gradientUnits="userSpaceOnUse"
>           cx="50%"
>           cy="50%"
>           r="25%"
>         >
>           {hovered && (
>             <>
>               <stop offset="0%" stopColor="#eab308" />
>               <stop offset="25%" stopColor="#ef4444" />…

## Evidence index

| Case | Creator | GoodCase evidence | Finished media | Original source | Card |
| --- | --- | --- | --- | --- | --- |
| Direction Aware Hover | Aceternity UI | [GoodCase](https://goodcase.ai/cases/direction-aware-hover) | [Media](https://media.goodcase.ai/cases/b8b986c47f85.webp) | [Original](https://ui.aceternity.com/components/direction-aware-hover) | E1 |
| Hero Highlight | Aceternity UI | [GoodCase](https://goodcase.ai/cases/hero-highlight) | [Media](https://media.goodcase.ai/cases/55b88bf3221d.webp) | [Original](https://ui.aceternity.com/components/hero-highlight) | E2 |
| Hero Parallax | Aceternity UI | [GoodCase](https://goodcase.ai/cases/hero-parallax) | [Media](https://media.goodcase.ai/cases/97c62955961f.webp) | [Original](https://ui.aceternity.com/components/hero-parallax) | E3 |
| Hover Border Gradient | Aceternity UI | [GoodCase](https://goodcase.ai/cases/hover-border-gradient) | [Media](https://media.goodcase.ai/cases/7240e9526189.webp) | [Original](https://ui.aceternity.com/components/hover-border-gradient) | E4 |
| Hover Effect | Aceternity UI | [GoodCase](https://goodcase.ai/cases/hover-effect) | [Media](https://media.goodcase.ai/cases/7a472bb004f7.webp) | [Original](https://ui.aceternity.com/components/card-hover-effect) | E5 |
| Parallax Hero Images | Aceternity UI | [GoodCase](https://goodcase.ai/cases/parallax-hero-images) | [Media](https://media.goodcase.ai/cases/680ae6c86288.webp) | [Original](https://ui.aceternity.com/components/parallax-hero-images) | E6 |
| Text Hover Effect | Aceternity UI | [GoodCase](https://goodcase.ai/cases/text-hover-effect) | [Media](https://media.goodcase.ai/cases/48686f539bc0.webp) | [Original](https://ui.aceternity.com/components/text-hover-effect) | E7 |

## Derivation boundary

- Inclusion means the published Case matched the method pattern; it does not prove the creator used this exact synthesized workflow.
- Popularity is not part of the Skill threshold.
- Treat GoodCase summaries as editorial evidence and the linked original source as primary evidence.
