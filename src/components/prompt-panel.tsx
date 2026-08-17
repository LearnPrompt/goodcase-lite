"use client";

import { PromptViewer } from "@/components/prompt-viewer";
import { RetestVoteButton } from "@/components/retest-vote-button";
import { useMessages } from "@/i18n/client";
import {
  formatStabilityScore,
  resolveStabilityState,
} from "@/lib/stability";

export function PromptPanel({
  caseSlug,
  promptPreview,
  promptFull,
  contentLocale,
  promptTranslationZh,
  promptTranslationEn,
  promptContributionNotes,
  recommendedModels,
  stabilityScore,
  evidenceLevel,
  costBand,
}: {
  caseSlug: string;
  promptPreview: string;
  promptFull: string;
  contentLocale?: "zh-CN" | "en";
  promptTranslationZh?: string;
  promptTranslationEn?: string;
  promptContributionNotes: string[];
  recommendedModels: string[];
  stabilityScore: number;
  /** 区分「没测过」和「复测未通过」的判别位，见 src/lib/stability.ts。 */
  evidenceLevel?: string | null;
  costBand: string;
}) {
  const messages = useMessages();
  const prompt = promptFull.trim() || promptPreview.trim();
  const stabilityState = resolveStabilityState(stabilityScore, evidenceLevel);

  return (
    <article id="prompt" className="gc-panel overflow-hidden">
      <section className="p-5 sm:p-7">
        <PromptViewer
          original={prompt}
          originalLocale={contentLocale}
          translationZh={promptTranslationZh}
          translationEn={promptTranslationEn}
        />
      </section>

      <section className="border-t border-[var(--orange)] bg-[rgba(194,65,12,0.055)] p-5 sm:p-7">
        <p className="gc-eyebrow">{messages.prompt.reusableMethod}</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.36fr)]">
          {/* 三段式：关键决定 / 换到你的题材 / 容易翻车。
              取代原来按类目拼的两段模板，内容按每条 Case 单独撰写。 */}
          <div className="grid border-l border-t border-[var(--hair)] md:grid-cols-3">
            {promptContributionNotes.slice(0, 3).map((note, index) => (
              <div key={note} className="border-b border-r border-[var(--hair)] bg-white p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--orange)]">
                  {[
                    messages.prompt.keyDecisions,
                    messages.prompt.adaptToYours,
                    messages.prompt.failureModes,
                  ][index]}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--muted)]">
                  {note}
                </p>
              </div>
            ))}
          </div>
          <div className="border border-[var(--hair)] bg-white p-4">
            <p className="gc-stat-label">{messages.prompt.recommendedModels}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {recommendedModels.map((model) => (
                <span key={model} className="gc-chip">
                  {model}
                </span>
              ))}
            </div>
            <dl className="mt-4 grid gap-2 text-sm leading-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--concrete)] pt-2">
                <dt className="text-[var(--muted)]">
                  {messages.common.stability}
                </dt>
                {/* 缺测时这一格从一句死文案换成真能投的按钮，
                    有实测分时维持原样，不塞多余交互。
                    复测跑过没通过是第三种状态：结论已经有了，催复测按钮不该再出现。 */}
                <dd className="font-semibold">
                  {stabilityState === "measured" ? (
                    `${formatStabilityScore(stabilityScore)} / 100`
                  ) : stabilityState === "failed" ? (
                    <span className="text-[var(--orange)]">
                      {messages.stability.failed}
                    </span>
                  ) : (
                    <RetestVoteButton caseSlug={caseSlug} />
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[var(--concrete)] pt-2">
                <dt className="text-[var(--muted)]">{messages.cost.label}</dt>
                <dd className="font-semibold">{costBand}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </article>
  );
}
