"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useMessages } from "@/i18n/client";
import { trackEvent } from "@/lib/analytics";

type SubmitState = "idle" | "submitting" | "success" | "rate-limited" | "unavailable" | "error";

const inputClass =
  "min-h-11 w-full border border-[var(--hair)] bg-white px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--mute)] focus:border-[var(--ink)] focus:outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--mute)]">
        {label}
        {required ? <span className="ml-1 text-[var(--orange)]">*</span> : null}
      </span>
      {children}
    </label>
  );
}

export function SubmitForm() {
  const locale = useLocale();
  const messages = useMessages();
  const categoryOptions = [
    { value: "web", label: messages.category.web },
    { value: "image", label: messages.category.image },
    { value: "video", label: messages.category.video },
    { value: "copy", label: messages.category.copy },
    { value: "hardware", label: messages.category.hardware },
  ] as const;
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [receiptId, setReceiptId] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    setState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: formData.get("url"),
          title: formData.get("title"),
          category: formData.get("category"),
          summary: formData.get("summary"),
          prompt: formData.get("prompt"),
          creatorName: formData.get("creatorName"),
          contact: formData.get("contact"),
          website: formData.get("website"),
          locale,
        }),
      });

      if (response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { receiptId?: string }
          | null;
        setReceiptId(data?.receiptId || "");
        trackEvent("case_submit", { category: String(formData.get("category") || "") });
        setState("success");
        form.reset();
        return;
      }

      if (response.status === 429) {
        setState("rate-limited");
        return;
      }

      if (response.status === 503) {
        setState("unavailable");
        return;
      }

      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setErrorMessage(data?.error || messages.submitForm.genericError);
      setState("error");
    } catch {
      setErrorMessage(messages.submitForm.networkError);
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div role="status" aria-live="polite" className="border border-[var(--hair)] bg-white p-8">
        <p className="text-lg font-semibold text-[var(--ink)]">
          {messages.submitForm.received}
        </p>
        <p className="mt-2 text-sm leading-7 text-[var(--mute)]">
          {messages.submitForm.receivedDescription}
        </p>
        {receiptId ? (
          <p className="mt-3 font-mono text-xs text-[var(--mute)]">
            {messages.submitForm.receipt} {receiptId.slice(0, 8)}
          </p>
        ) : null}
        <button
          type="button"
          className="gc-btn mt-6"
          onClick={() => {
            setReceiptId("");
            setState("idle");
          }}
        >
          {messages.submitForm.again}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 border border-[var(--hair)] bg-white p-6 md:p-8">
      <Field label={messages.submitForm.url} required>
        <input
          type="url"
          name="url"
          required
          maxLength={2000}
          placeholder={messages.submitForm.urlPlaceholder}
          className={inputClass}
        />
      </Field>

      <Field label={messages.submitForm.title} required>
        <input
          type="text"
          name="title"
          required
          maxLength={120}
          placeholder={messages.submitForm.titlePlaceholder}
          className={inputClass}
        />
      </Field>

      <Field label={messages.submitForm.category}>
        <select name="category" defaultValue="web" className={inputClass}>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={messages.submitForm.summary}>
        <textarea
          name="summary"
          rows={4}
          maxLength={2000}
          placeholder={messages.submitForm.summaryPlaceholder}
          className={inputClass}
        />
      </Field>

      <Field label={messages.submitForm.prompt}>
        <textarea
          name="prompt"
          rows={6}
          maxLength={2000}
          placeholder={messages.submitForm.promptPlaceholder}
          className={`${inputClass} font-mono text-xs leading-6`}
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label={messages.submitForm.name}>
          <input type="text" name="creatorName" maxLength={120} placeholder={messages.submitForm.namePlaceholder} className={inputClass} />
        </Field>
        <Field label={messages.submitForm.contact}>
          <input
            type="text"
            name="contact"
            maxLength={120}
            placeholder={messages.submitForm.contactPlaceholder}
            className={inputClass}
          />
        </Field>
      </div>

      {/* honeypot：真人看不到也不会填，机器人填了就假成功。 */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {state === "rate-limited" ? (
        <p className="border border-[var(--orange)] bg-[rgba(194,65,12,0.06)] p-3 text-sm text-[var(--ink)]">
          {messages.submitForm.rateLimited}
        </p>
      ) : null}
      {state === "unavailable" ? (
        <p className="border border-[var(--hair)] bg-[var(--paper-2)] p-3 text-sm text-[var(--ink)]">
          {messages.submitForm.unavailable}
        </p>
      ) : null}
      {state === "error" && errorMessage ? (
        <p className="border border-[var(--orange)] bg-[rgba(194,65,12,0.06)] p-3 text-sm text-[var(--ink)]">
          {errorMessage}
        </p>
      ) : null}

      <div>
        <button type="submit" disabled={state === "submitting"} className="gc-btn gc-btn-primary disabled:opacity-60">
          {state === "submitting"
            ? messages.submitForm.submitting
            : messages.submitForm.submit}
        </button>
      </div>
    </form>
  );
}
