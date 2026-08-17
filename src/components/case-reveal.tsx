"use client";

import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// 卡片列表页用 article.gc-card（见 case-card.tsx），首页 deck 的卡片
// 不用这个类名，改用 data-reveal 属性标记（见 home-case-deck.tsx）。
const REVEAL_SELECTOR = "article.gc-card, [data-reveal]";

/**
 * 卡片滚动进场动效，取代旧的「默认灰度、悬停还原本色」交互——
 * 图片改回默认彩色后，进场提示改用位移 + 淡入而不是颜色变化。
 *
 * 用 IntersectionObserver 而不是 ScrollTrigger 做触发：IO 对每个被观察
 * 元素必发一次初始回调，元素只要进过视口就一定会被还原，不存在
 * 「触发器静默失效、卡片永远停在隐藏态」的失败模式；cleanup 时也会
 * 清掉内联样式兜底。
 *
 * 挂在 layout.tsx 的 body 里，跟每个语言页面共用一份。
 */
export function CaseReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // 减弱动效偏好：什么都不做，卡片保持默认可见，不做位移/淡入。
      return;
    }

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
    );
    if (elements.length === 0) return;

    // 初始隐藏态只能在这里用 gsap.set 做，绝不能写成 CSS 类的
    // opacity-0——万一这段 JS 没跑起来，卡片必须保持可见，不能整页空白。
    gsap.set(elements, { autoAlpha: 0, y: 24 });

    const observer = new IntersectionObserver(
      (entries) => {
        const batch = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement);
        if (batch.length === 0) return;
        batch.forEach((el) => observer.unobserve(el));
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.07,
          overwrite: true,
        });
      },
      // 底边收 10%，等价于旧 ScrollTrigger 的 start: "top 90%"。
      { rootMargin: "0px 0px -10% 0px" }
    );
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      // 路由切换 / 严格模式重跑时把内联样式清干净，
      // 不给下一次 effect 留下看不见的卡片。
      gsap.killTweensOf(elements);
      gsap.set(elements, { clearProps: "opacity,visibility,transform" });
    };
  }, [pathname]);

  return null;
}
