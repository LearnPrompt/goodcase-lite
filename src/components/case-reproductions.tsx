import Image from "next/image";
import {
  countDistinctReproducers,
  type CaseReproduction,
} from "@/lib/case-reproductions-data";
import { CreatorAvatar } from "@/components/creator-avatar";
import type { Locale } from "@/i18n/config";
import { optimizedPosterUrl } from "@/lib/optimized-poster";

function formatReproducedAt(value: string | null, locale: Locale) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function ReproductionMedia({
  reproduction,
  fallbackPosterUrl,
  isEnglish,
}: {
  reproduction: CaseReproduction;
  fallbackPosterUrl: string | null;
  isEnglish: boolean;
}) {
  if (reproduction.mediaKind === "video") {
    // 复现件常常缺自己的 poster（现有 17 条候选全缺）：用父 Case 的 poster 兜底，
    // 两者都没有时不传 poster，交给浏览器取视频首帧，绝不放伪造占位图。
    const poster = reproduction.posterUrl ?? fallbackPosterUrl ?? undefined;
    return (
      <video
        controls
        playsInline
        preload="metadata"
        src={reproduction.mediaUrl}
        poster={optimizedPosterUrl(poster, 1080)}
        className="aspect-video w-full bg-black object-contain"
      >
        {isEnglish
          ? "Your browser does not support video playback."
          : "你的浏览器不支持视频播放。"}
      </video>
    );
  }

  return (
    <a
      href={reproduction.mediaUrl}
      target="_blank"
      rel="noreferrer"
      className="block border border-[var(--hair)] bg-[var(--paper-2)] p-2"
    >
      <Image
        src={reproduction.mediaUrl}
        alt={
          isEnglish
            ? `Reproduction by ${reproduction.reproducer}`
            : `${reproduction.reproducer} 的复现作品`
        }
        width={1600}
        height={1200}
        className="mx-auto h-auto max-h-[46rem] w-auto max-w-full object-contain"
      />
    </a>
  );
}

function ReproductionCard({
  reproduction,
  fallbackPosterUrl,
  locale,
}: {
  reproduction: CaseReproduction;
  fallbackPosterUrl: string | null;
  locale: Locale;
}) {
  const isEnglish = locale === "en";
  const reproducedAt = formatReproducedAt(reproduction.reproducedAt, locale);

  return (
    <article className="border border-[var(--hair)] bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CreatorAvatar
            name={reproduction.reproducer}
            avatarUrl={reproduction.reproducerAvatarUrl ?? undefined}
            size={40}
          />
          <div>
            <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
              {isEnglish ? "Reproduced by" : "复现者"}
            </span>
            <span className="mt-1 block text-sm font-semibold">
              {reproduction.reproducer}
            </span>
          </div>
        </div>
        {reproducedAt ? (
          <span className="font-mono text-[10px] text-[var(--muted)]">
            {reproducedAt}
          </span>
        ) : null}
      </div>

      <ReproductionMedia
        reproduction={reproduction}
        fallbackPosterUrl={fallbackPosterUrl}
        isEnglish={isEnglish}
      />

      {reproduction.models.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {reproduction.models.map((model) => (
            <span key={model} className="gc-chip">
              {model}
            </span>
          ))}
        </div>
      ) : null}

      {reproduction.referenceNote ? (
        <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
          {reproduction.referenceNote}
        </p>
      ) : null}

      {reproduction.sourceUrl ? (
        <a
          href={reproduction.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="gc-action mt-3 w-fit"
        >
          {isEnglish ? "Reproduction source" : "复现出处"} ↗
        </a>
      ) : null}
    </article>
  );
}

/**
 * 「N 人复现」区。挂在原 Case 详情页，紧邻「独立复测证据」区：
 * 复测证据是 goodcase 自己重跑的结果，复现区是别人各自跑出的作品，
 * 两者一起把「这条 prompt 真能复现」讲透。records 为空时整块不渲染。
 */
export function CaseReproductions({
  records,
  fallbackPosterUrl = null,
  locale,
}: {
  records: CaseReproduction[];
  fallbackPosterUrl?: string | null;
  locale: Locale;
}) {
  if (records.length === 0) return null;
  const isEnglish = locale === "en";
  const distinct = countDistinctReproducers(records);

  return (
    <section className="gc-panel-muted p-5 sm:p-6" id="reproductions">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--hair)] pb-5">
        <div>
          <p className="gc-eyebrow">
            {isEnglish ? "Independent reproductions" : "多人复现"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
            {isEnglish
              ? `${distinct} ${
                  distinct === 1 ? "person" : "people"
                } reproduced this prompt with their own work.`
              : `${distinct} 个人用同一段 Prompt 跑出了自己的作品。`}
          </h2>
        </div>
        <span className="gc-chip gc-chip-accent">
          {isEnglish
            ? "Reproductions · not the creator's original"
            : "复现作品 · 非作者原作"}
        </span>
      </div>
      <div className="mt-5 grid gap-4">
        {records.map((reproduction) => (
          <ReproductionCard
            key={reproduction.id}
            reproduction={reproduction}
            fallbackPosterUrl={fallbackPosterUrl}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}
