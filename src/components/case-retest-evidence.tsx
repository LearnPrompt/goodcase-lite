import Image from "next/image";
import {
  buildCaseRetestRunDisplays,
  type CaseRetestEvidence as Evidence,
  type CaseRetestRunDisplay,
} from "@/lib/case-retest-evidence-data";
import type { Locale } from "@/i18n/config";

function formatScore(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatTestedAt(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function EvidenceMedia({
  evidence,
  isEnglish,
}: {
  evidence: Evidence;
  isEnglish: boolean;
}) {
  if (evidence.status === "failed") {
    return (
      <div className="flex min-h-52 items-center justify-center border border-dashed border-[var(--hair)] bg-[var(--paper-2)] p-6 text-center text-sm leading-7 text-[var(--muted)]">
        {isEnglish
          ? "The generation failed or was refused, so there is no fabricated placeholder. The failed attempt remains part of the public record."
          : "本次生成失败或被策略拒绝，因此不放伪造占位图；失败本身也作为公开复测记录保留。"}
      </div>
    );
  }

  if (evidence.kind === "video" && evidence.artifacts.video) {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        src={evidence.artifacts.video}
        className="aspect-video w-full bg-black object-contain"
      >
        {isEnglish
          ? "Your browser does not support video playback."
          : "你的浏览器不支持视频播放。"}
      </video>
    );
  }

  if (evidence.kind === "ui") {
    const desktop = evidence.artifacts.desktop;
    const mobile = evidence.artifacts.mobile;
    return (
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(170px,0.26fr)]">
        {desktop ? (
          <a
            href={desktop}
            target="_blank"
            rel="noreferrer"
            className="border border-[var(--hair)] bg-[var(--paper-2)] p-2"
          >
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
              {isEnglish ? "Desktop capture" : "桌面截图"}
            </span>
            <Image
              src={desktop}
              alt={isEnglish ? "Generated desktop UI" : "模型生成 UI 的桌面截图"}
              width={1280}
              height={800}
              className="h-auto w-full bg-white object-contain"
            />
          </a>
        ) : null}
        {mobile ? (
          <a
            href={mobile}
            target="_blank"
            rel="noreferrer"
            className="border border-[var(--hair)] bg-[var(--paper-2)] p-2"
          >
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
              {isEnglish ? "Mobile capture" : "手机截图"}
            </span>
            <Image
              src={mobile}
              alt={isEnglish ? "Generated mobile UI" : "模型生成 UI 的手机截图"}
              width={390}
              height={844}
              className="mx-auto h-auto max-h-[34rem] w-auto bg-white object-contain"
            />
          </a>
        ) : null}
      </div>
    );
  }

  const image = evidence.artifacts.primary;
  return image ? (
    <a
      href={image}
      target="_blank"
      rel="noreferrer"
      className="block border border-[var(--hair)] bg-[var(--paper-2)] p-2"
    >
      <Image
        src={image}
        alt={isEnglish ? "Generated retest result" : "模型生成的复测结果"}
        width={1600}
        height={1200}
        className="mx-auto h-auto max-h-[46rem] w-auto max-w-full object-contain"
      />
    </a>
  ) : null;
}

function disclosureText(evidence: Evidence, isEnglish: boolean) {
  if (evidence.modelDisclosure === "requested-model-unverified") {
    return isEnglish
      ? "The requested model is recorded, but the generation receipt did not expose a verifiable underlying model ID."
      : "记录的是请求模型；生成回执未提供可核验的底层 model ID。";
  }
  if (evidence.modelDisclosure === "provider-reported") {
    return isEnglish
      ? "Model and resolution follow the provider task receipt."
      : "模型与分辨率以服务商任务回执为准。";
  }
  return null;
}

function EvidenceCard({
  evidence,
  locale,
  runDisplay,
}: {
  evidence: Evidence;
  locale: Locale;
  runDisplay: CaseRetestRunDisplay;
}) {
  const isEnglish = locale === "en";
  const disclosure = disclosureText(evidence, isEnglish);
  const kindLabel = isEnglish
    ? { image: "Image", ui: "UI", video: "Video" }[evidence.kind]
    : { image: "图片", ui: "UI", video: "视频" }[evidence.kind];

  return (
    <article className="border border-[var(--hair)] bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="gc-chip gc-chip-accent">{kindLabel}</span>
            <span className="gc-chip">
              {evidence.status === "complete"
                ? isEnglish
                  ? "Generated evidence"
                  : "生成证据"
                : isEnglish
                  ? "Failed attempt"
                  : "失败记录"}
            </span>
            {evidence.automaticOnly ? (
              <span className="gc-chip">
                {isEnglish ? "AI judged" : "AI 自动评分"}
              </span>
            ) : null}
            {runDisplay.total > 1 ? (
              <span className="gc-chip">
                {isEnglish
                  ? `Independent run ${runDisplay.index}/${runDisplay.total}`
                  : `同模型独立运行 · 第 ${runDisplay.index}/${runDisplay.total} 次`}
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em]">
            {runDisplay.model}
          </h3>
          <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">
            {formatTestedAt(evidence.testedAt, locale)}
          </p>
        </div>
        {evidence.finalScore !== null ? (
          <div className="min-w-20 border border-[var(--ink)] px-3 py-2 text-right">
            <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
              {isEnglish ? "Retest score" : "复测分"}
            </span>
            <span className="mt-1 block text-2xl font-semibold">
              {formatScore(evidence.finalScore)}
            </span>
          </div>
        ) : null}
      </div>

      <EvidenceMedia evidence={evidence} isEnglish={isEnglish} />

      {evidence.artifacts.html ? (
        <a
          href={evidence.artifacts.html}
          target="_blank"
          rel="noreferrer"
          className="gc-action mt-3 w-fit"
        >
          {isEnglish ? "Download generated HTML" : "下载生成 HTML"} ↓
        </a>
      ) : null}

      {evidence.judges.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--hair)] pt-4 font-mono text-[10px] text-[var(--muted)]">
          {evidence.judges.map((judge) => (
            <span key={`${judge.model}-${judge.score}`}>
              {judge.model} · {formatScore(judge.score)}
            </span>
          ))}
          {evidence.disagreement !== null ? (
            <span>
              {isEnglish ? "gap" : "分歧"} · {formatScore(evidence.disagreement)}
            </span>
          ) : null}
        </div>
      ) : null}

      {disclosure || evidence.failureReason ? (
        <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
          {disclosure}
          {disclosure && evidence.failureReason ? " " : null}
          {evidence.failureReason
            ? `${isEnglish ? "Recorded failure" : "失败记录"}: ${evidence.failureReason}`
            : null}
        </p>
      ) : null}
    </article>
  );
}

export function CaseRetestEvidence({
  records,
  locale,
}: {
  records: Evidence[];
  locale: Locale;
}) {
  if (records.length === 0) return null;
  const isEnglish = locale === "en";
  const runDisplays = buildCaseRetestRunDisplays(records);
  const primaryRecords = records.filter((evidence) => {
    const display = runDisplays.get(evidence.id);
    return display && display.index === display.total;
  });

  return (
    <section className="gc-panel-muted p-5 sm:p-6" id="retest-evidence">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--hair)] pb-5">
        <div>
          <p className="gc-eyebrow">
            {isEnglish ? "Independent retest evidence" : "独立复测证据"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
            {isEnglish
              ? "See what the same prompt generated in our test."
              : "同一段 Prompt，在我们的测试里实际生成了什么。"}
          </h2>
        </div>
        <span className="gc-chip gc-chip-accent">
          {isEnglish ? "Retest output · not the creator's original" : "复测生成 · 非作者原作"}
        </span>
      </div>
      <div className="mt-5 grid gap-4">
        {primaryRecords.map((evidence) => {
          const runDisplay = runDisplays.get(evidence.id);
          if (!runDisplay) return null;
          const history = records.filter((candidate) => {
            const candidateDisplay = runDisplays.get(candidate.id);
            return (
              candidate.id !== evidence.id &&
              candidate.kind === evidence.kind &&
              candidateDisplay?.model.toLocaleLowerCase("en-US") ===
                runDisplay.model.toLocaleLowerCase("en-US")
            );
          });
          return (
            <div key={evidence.id} className="grid gap-3">
              <EvidenceCard
                evidence={evidence}
                locale={locale}
                runDisplay={runDisplay}
              />
              {history.length > 0 ? (
                <details className="border border-[var(--hair)] bg-[var(--paper-2)] p-3 sm:p-4">
                  <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.08em]">
                    {isEnglish
                      ? `${runDisplay.model}: ${runDisplay.total} independent runs · show ${history.length} earlier`
                      : `${runDisplay.model} 共 ${runDisplay.total} 次独立运行 · 展开前 ${history.length} 次`}
                  </summary>
                  <div className="mt-3 grid gap-3">
                    {history.map((historical) => {
                      const historicalDisplay = runDisplays.get(historical.id);
                      return historicalDisplay ? (
                        <EvidenceCard
                          key={historical.id}
                          evidence={historical}
                          locale={locale}
                          runDisplay={historicalDisplay}
                        />
                      ) : null;
                    })}
                  </div>
                </details>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
