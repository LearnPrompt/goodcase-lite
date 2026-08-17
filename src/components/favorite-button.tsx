"use client";

import { toggleFavorite, useFavoritedSlugs } from "@/lib/local-favorites";
import { useMessages } from "@/i18n/client";

export function FavoriteButton({ caseSlug }: { caseSlug: string }) {
  const messages = useMessages();
  // SSR 与首次 hydration 一律按未收藏渲染（useFavoritedSlugs 初始为空数组），
  // 挂载后读 localStorage 更新，避免 hydration mismatch。
  const favoritedSlugs = useFavoritedSlugs();
  const isFavorited = favoritedSlugs.includes(caseSlug);

  return (
    <button
      type="button"
      aria-pressed={isFavorited}
      onClick={(event) => {
        // 卡片上有可点击区域时避免触发外层导航。
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(caseSlug);
      }}
      className={`gc-action whitespace-nowrap ${
        isFavorited
          ? "border-[var(--orange)] bg-[var(--orange)] text-white"
          : ""
      }`}
    >
      <span aria-hidden="true" className={isFavorited ? "text-[var(--accent)]" : undefined}>
        {isFavorited ? "★" : "☆"}
      </span>
      <span>
        {isFavorited
          ? messages.interaction.favorited
          : messages.interaction.favorite}
      </span>
    </button>
  );
}
