# Case evidence

This is an unofficial synthesis of a recurring method found in 97 published Cases attributed to Aceternity UI. It is not an official Skill from that creator.

## Operating rule

Choose one evidence card below as the anchor before drafting. Inspect its finished media, then state which traits will be preserved, replaced, and avoided. A title match alone is not evidence.

### E1 · 3D Animated Pin

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

### E2 · 3D Globe

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

### E3 · 3D Marquee

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

### E4 · Animated Modal

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/animated-modal) · [finished media](https://media.goodcase.ai/cases/89e7955c1676.webp) · [original source](https://ui.aceternity.com/components/animated-modal)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Animated Modal」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/animated-modal.tsx
> "use client";
> import { cn } from "@/lib/utils";
> import { AnimatePresence, motion } from "motion/react";
> import React, {
>   ReactNode,
>   createContext,
>   useContext,
>   useEffect,
>   useRef,
>   useState,
> } from "react";
>
> interface ModalContextType {
>   open: boolean;
>   setOpen: (open: boolean) => void;
> }
>
> const ModalContext = createContext<ModalContextType | undefined>(undefined);
>
> export const ModalProvider = ({ children }: { children: ReactNode }) => {
>   const [open, setOpen] = useState(false);
>
>   return (
>     <ModalContext.Provider value={{ open, setOpen }}>
>       {children}
>     </ModalContext.Provider>
>   );
> };
>
> export const useModal = () => {
>   const context = useContext(ModalContext);
>   if (!context) {
>     throw new Error("useModal must be used within a ModalProvider");
>   }
>   return context;
> };
>
> export function Modal({ children }: { children: ReactNode }) {
>   return <ModalProvider>{children}</ModalProvider>;
> }
>
> export const ModalTrigger = ({
>   children,
>   className,
> }: {
>   children: ReactNode;
>   className?: string;
> }) => {
>   const { setOpen } = useModal();
>   return (
>     <button
>       className={cn(
>         "px-4 py-2 rounded-md text-black dark:text-white text-center relative overflow-hidden",
>         className
>       )}
>       onClick={() => setOpen(true)}
>     >
>       {children}
>     </button>
>   );
> };
>
> export const ModalBody = ({
>   children,
>   className,
> }: {
>   children: ReactNode;
>   className?: string;
> }) => {
>   const { open } = useModal();
>
>   useEffect(() => {
>     if (open) {
>       document.body.style.overflow = "hidden";
>     } else {…

### E5 · Animated Tabs

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/animated-tabs) · [finished media](https://media.goodcase.ai/cases/ee1949cbe51d.mp4) · [poster](https://media.goodcase.ai/cases/e52e13bc107d.webp) · [original source](https://ui.aceternity.com/components/tabs)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Animated Tabs」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/tabs.tsx
> "use client";
>
> import { useState } from "react";
> import { motion } from "motion/react";
> import { cn } from "@/lib/utils";
>
> type Tab = {
>   title: string;
>   value: string;
>   content?: string | React.ReactNode | any;
> };
>
> export const Tabs = ({
>   tabs: propTabs,
>   containerClassName,
>   activeTabClassName,
>   tabClassName,
>   contentClassName,
> }: {
>   tabs: Tab[];
>   containerClassName?: string;
>   activeTabClassName?: string;
>   tabClassName?: string;
>   contentClassName?: string;
> }) => {
>   const [active, setActive] = useState<Tab>(propTabs[0]);
>   const [tabs, setTabs] = useState<Tab[]>(propTabs);
>
>   const moveSelectedTabToTop = (idx: number) => {
>     const newTabs = [...propTabs];
>     const selectedTab = newTabs.splice(idx, 1);
>     newTabs.unshift(selectedTab[0]);
>     setTabs(newTabs);
>     setActive(newTabs[0]);
>   };
>
>   const [hovering, setHovering] = useState(false);
>
>   return (
>     <>
>       <div
>         className={cn(
>           "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
>           containerClassName
>         )}
>       >
>         {propTabs.map((tab, idx) => (
>           <button
>             key={tab.title}
>             onClick={() => {
>               moveSelectedTabToTop(idx);
>             }}
>             onMouseEnter={() => setHovering(true)}
>             onMouseLeave={() => setHovering(false)}
>             className={cn("relative px-4 py-2 rounded-full", tabClassName)}
>             style={{
>               transformStyle: "preserve-3d",
>             }}
>           >…

### E6 · Animated Testimonials

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/animated-testimonials) · [finished media](https://media.goodcase.ai/cases/92c8376dba8b.webp) · [original source](https://ui.aceternity.com/components/animated-testimonials)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Animated Testimonials」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/animated-testimonials.tsx
> "use client";
>
> import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
> import { motion, AnimatePresence } from "motion/react";
>
> import { useEffect, useState } from "react";
>
> type Testimonial = {
>   quote: string;
>   name: string;
>   designation: string;
>   src: string;
> };
> export const AnimatedTestimonials = ({
>   testimonials,
>   autoplay = false,
> }: {
>   testimonials: Testimonial[];
>   autoplay?: boolean;
> }) => {
>   const [active, setActive] = useState(0);
>
>   const handleNext = () => {
>     setActive((prev) => (prev + 1) % testimonials.length);
>   };
>
>   const handlePrev = () => {
>     setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
>   };
>
>   const isActive = (index: number) => {
>     return index === active;
>   };
>
>   useEffect(() => {
>     if (autoplay) {
>       const interval = setInterval(handleNext, 5000);
>       return () => clearInterval(interval);
>     }
>   }, [autoplay]);
>
>   const randomRotateY = () => {
>     return Math.floor(Math.random() * 21) - 10;
>   };
>   return (
>     <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
>       <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
>         <div>
>           <div className="relative h-80 w-full">
>             <AnimatePresence>
>               {testimonials.map((testimonial, index) => (
>                 <motion.div
>                   key={testimonial.src}
>                   initial={{
>                     opacity: 0,
>                     scale: 0.9,
>                     z: -100,
>                     rotate: ran…

### E7 · Animated Tooltip

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/animated-tooltip) · [finished media](https://media.goodcase.ai/cases/b577a1f54d3a.mov) · [poster](https://media.goodcase.ai/cases/17590805b193.webp) · [original source](https://ui.aceternity.com/components/animated-tooltip)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Animated Tooltip」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/animated-tooltip.tsx
> "use client";
>
> import React, { useState, useRef } from "react";
> import {
>   motion,
>   useTransform,
>   AnimatePresence,
>   useMotionValue,
>   useSpring,
> } from "motion/react";
>
> export const AnimatedTooltip = ({
>   items,
> }: {
>   items: {
>     id: number;
>     name: string;
>     designation: string;
>     image: string;
>   }[];
> }) => {
>   const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
>   const springConfig = { stiffness: 100, damping: 15 };
>   const x = useMotionValue(0);
>   const animationFrameRef = useRef<number | null>(null);
>
>   const rotate = useSpring(
>     useTransform(x, [-100, 100], [-45, 45]),
>     springConfig,
>   );
>   const translateX = useSpring(
>     useTransform(x, [-100, 100], [-50, 50]),
>     springConfig,
>   );
>
>   const handleMouseMove = (event: any) => {
>     if (animationFrameRef.current) {
>       cancelAnimationFrame(animationFrameRef.current);
>     }
>
>     animationFrameRef.current = requestAnimationFrame(() => {
>       const halfWidth = event.target.offsetWidth / 2;
>       x.set(event.nativeEvent.offsetX - halfWidth);
>     });
>   };
>
>   return (
>     <>
>       {items.map((item, idx) => (
>         <div
>           className="group relative -mr-4"
>           key={item.name}
>           onMouseEnter={() => setHoveredIndex(item.id)}
>           onMouseLeave={() => setHoveredIndex(null)}
>         >
>           <AnimatePresence>
>             {hoveredIndex === item.id && (
>               <motion.div
>                 initial={{ opacity: 0, y: 20, scale: 0.6 }}
>                 animate={{
>                   opacity: 1,
>                   y: 0,…

### E8 · Apple Cards Carousel

- Creator: Aceternity UI
- Evidence: [GoodCase](https://goodcase.ai/cases/apple-cards-carousel) · [finished media](https://media.goodcase.ai/cases/1a0c96a64741.webp) · [original source](https://ui.aceternity.com/components/apple-cards-carousel)
- Summary: 复制这段 TSX 组件源码，交给 Cursor、v0、Claude 等 AI 编程工具，说明这是「Apple Cards Carousel」的 Aceternity UI 组件实现，即可让它接入你的 React 项目，再按需替换文案、配色与触发参数复用。
- Prompt excerpt:

> // components/ui/apple-cards-carousel.tsx
> "use client";
> import React, {
>   useEffect,
>   useRef,
>   useState,
>   createContext,
>   useContext,
> } from "react";
> import {
>   IconArrowNarrowLeft,
>   IconArrowNarrowRight,
>   IconX,
> } from "@tabler/icons-react";
> import { cn } from "@/lib/utils";
> import { AnimatePresence, motion } from "motion/react";
> import Image, { ImageProps } from "next/image";
> import { useOutsideClick } from "@/hooks/use-outside-click";
>
> interface CarouselProps {
>   items: JSX.Element[];
>   initialScroll?: number;
> }
>
> type Card = {
>   src: string;
>   title: string;
>   category: string;
>   content: React.ReactNode;
> };
>
> export const CarouselContext = createContext<{
>   onCardClose: (index: number) => void;
>   currentIndex: number;
> }>({
>   onCardClose: () => {},
>   currentIndex: 0,
> });
>
> export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
>   const carouselRef = React.useRef<HTMLDivElement>(null);
>   const [canScrollLeft, setCanScrollLeft] = React.useState(false);
>   const [canScrollRight, setCanScrollRight] = React.useState(true);
>   const [currentIndex, setCurrentIndex] = useState(0);
>
>   useEffect(() => {
>     if (carouselRef.current) {
>       carouselRef.current.scrollLeft = initialScroll;
>       checkScrollability();
>     }
>   }, [initialScroll]);
>
>   const checkScrollability = () => {
>     if (carouselRef.current) {
>       const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
>       setCanScrollLeft(scrollLeft > 0);
>       setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
>     }
>   };
>
>   const scrollLeft = () => {
>     if (carouselRef.current) {…

## Evidence index

| Case | Creator | GoodCase evidence | Finished media | Original source | Card |
| --- | --- | --- | --- | --- | --- |
| 3D Animated Pin | Aceternity UI | [GoodCase](https://goodcase.ai/cases/3d-animated-pin) | [Media](https://media.goodcase.ai/cases/0b778c9ee5bc.mp4) | [Original](https://ui.aceternity.com/components/3d-pin) | E1 |
| 3D Globe | Aceternity UI | [GoodCase](https://goodcase.ai/cases/3d-globe) | [Media](https://media.goodcase.ai/cases/c98bbb728b7b.webp) | [Original](https://ui.aceternity.com/components/3d-globe) | E2 |
| 3D Marquee | Aceternity UI | [GoodCase](https://goodcase.ai/cases/3d-marquee) | [Media](https://media.goodcase.ai/cases/725a48f190ff.webp) | [Original](https://ui.aceternity.com/components/3d-marquee) | E3 |
| Animated Modal | Aceternity UI | [GoodCase](https://goodcase.ai/cases/animated-modal) | [Media](https://media.goodcase.ai/cases/89e7955c1676.webp) | [Original](https://ui.aceternity.com/components/animated-modal) | E4 |
| Animated Tabs | Aceternity UI | [GoodCase](https://goodcase.ai/cases/animated-tabs) | [Media](https://media.goodcase.ai/cases/ee1949cbe51d.mp4) | [Original](https://ui.aceternity.com/components/tabs) | E5 |
| Animated Testimonials | Aceternity UI | [GoodCase](https://goodcase.ai/cases/animated-testimonials) | [Media](https://media.goodcase.ai/cases/92c8376dba8b.webp) | [Original](https://ui.aceternity.com/components/animated-testimonials) | E6 |
| Animated Tooltip | Aceternity UI | [GoodCase](https://goodcase.ai/cases/animated-tooltip) | [Media](https://media.goodcase.ai/cases/b577a1f54d3a.mov) | [Original](https://ui.aceternity.com/components/animated-tooltip) | E7 |
| Apple Cards Carousel | Aceternity UI | [GoodCase](https://goodcase.ai/cases/apple-cards-carousel) | [Media](https://media.goodcase.ai/cases/1a0c96a64741.webp) | [Original](https://ui.aceternity.com/components/apple-cards-carousel) | E8 |
| ASCII Art | Aceternity UI | [GoodCase](https://goodcase.ai/cases/ascii-art) | [Media](https://media.goodcase.ai/cases/cc7e5f4e02f0.webp) | [Original](https://ui.aceternity.com/components/ascii-art) | E— |
| Aurora Background | Aceternity UI | [GoodCase](https://goodcase.ai/cases/aurora-background) | [Media](https://media.goodcase.ai/cases/f5af773675b0.webp) | [Original](https://ui.aceternity.com/components/aurora-background) | E— |
| Background Beams | Aceternity UI | [GoodCase](https://goodcase.ai/cases/background-beams) | [Media](https://media.goodcase.ai/cases/6282a2b80eb8.mov) | [Original](https://ui.aceternity.com/components/background-beams) | E— |
| Background Beams With Collision | Aceternity UI | [GoodCase](https://goodcase.ai/cases/background-beams-with-collision) | [Media](https://media.goodcase.ai/cases/4ad007e64c9e.webp) | [Original](https://ui.aceternity.com/components/background-beams-with-collision) | E— |
| Background Boxes | Aceternity UI | [GoodCase](https://goodcase.ai/cases/background-boxes) | [Media](https://media.goodcase.ai/cases/70a18952a615.webp) | [Original](https://ui.aceternity.com/components/background-boxes) | E— |
| Background Gradient | Aceternity UI | [GoodCase](https://goodcase.ai/cases/background-gradient) | [Media](https://media.goodcase.ai/cases/e45ccfc01577.mp4) | [Original](https://ui.aceternity.com/components/background-gradient) | E— |
| Background Gradient Animation | Aceternity UI | [GoodCase](https://goodcase.ai/cases/background-gradient-animation) | [Media](https://media.goodcase.ai/cases/1c479e1eae48.mp4) | [Original](https://ui.aceternity.com/components/background-gradient-animation) | E— |
| Background Lines | Aceternity UI | [GoodCase](https://goodcase.ai/cases/background-lines) | [Media](https://media.goodcase.ai/cases/a4c76af1146a.webp) | [Original](https://ui.aceternity.com/components/background-lines) | E— |
| Background Ripple Effect | Aceternity UI | [GoodCase](https://goodcase.ai/cases/background-ripple-effect) | [Media](https://media.goodcase.ai/cases/e1b083c9a0f7.webp) | [Original](https://ui.aceternity.com/components/background-ripple-effect) | E— |
| Bento Grid | Aceternity UI | [GoodCase](https://goodcase.ai/cases/bento-grid) | [Media](https://media.goodcase.ai/cases/85219fc8f623.mp4) | [Original](https://ui.aceternity.com/components/bento-grid) | E— |
| Canvas Reveal Effect | Aceternity UI | [GoodCase](https://goodcase.ai/cases/canvas-reveal-effect) | [Media](https://media.goodcase.ai/cases/48241ccdf177.webp) | [Original](https://ui.aceternity.com/components/canvas-reveal-effect) | E— |
| Canvas Text | Aceternity UI | [GoodCase](https://goodcase.ai/cases/canvas-text) | [Media](https://media.goodcase.ai/cases/8702d3866e9b.webp) | [Original](https://ui.aceternity.com/components/canvas-text) | E— |

## Derivation boundary

- Inclusion means the published Case matched the method pattern; it does not prove the creator used this exact synthesized workflow.
- Popularity is not part of the Skill threshold.
- Treat GoodCase summaries as editorial evidence and the linked original source as primary evidence.
