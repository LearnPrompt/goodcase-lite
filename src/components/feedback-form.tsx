"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useMessages } from "@/i18n/client";

type FeedbackState = "idle" | "submitting" | "success" | "error";

export function FeedbackForm() {
  const locale = useLocale();
  const messages = useMessages();
  const [state, setState] = useState<FeedbackState>("idle");
  const [receiptId, setReceiptId] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    setState("submitting");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: formData.get("kind"),
          message: formData.get("message"),
          contact: formData.get("contact"),
          website: formData.get("website"),
          page: window.location.pathname,
          locale,
        }),
      });

      if (!response.ok) {
        setState("error");
        return;
      }

      const data = (await response.json().catch(() => null)) as
        | { receiptId?: string }
        | null;
      setReceiptId(data?.receiptId || "");
      form.reset();
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div role="status" aria-live="polite" className="gc-empty-state text-left">
        <p className="text-lg font-semibold text-[var(--ink)]">
          {messages.feedbackForm.received}
        </p>
        <p className="text-sm leading-7 text-[var(--muted)]">
          {messages.feedbackForm.receivedDescription}
        </p>
        {receiptId ? (
          <p className="font-mono text-xs text-[var(--muted)]">
            {messages.feedbackForm.receipt} {receiptId.slice(0, 8)}
          </p>
        ) : null}
        <div>
          <button
            type="button"
            className="gc-action"
            onClick={() => {
              setReceiptId("");
              setState("idle");
            }}
          >
            {messages.feedbackForm.again}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2">
        <span className="gc-stat-label">{messages.feedbackForm.kind}</span>
        <select
          name="kind"
          className="min-h-11 border border-[var(--hair)] bg-white px-3 text-sm focus:border-[var(--orange)] focus:outline-none"
        >
          <option value="content">{messages.feedbackForm.content}</option>
          <option value="bug">{messages.feedbackForm.bug}</option>
          <option value="suggestion">{messages.feedbackForm.suggestion}</option>
          <option value="other">{messages.feedbackForm.other}</option>
        </select>
      </label>
      <label className="grid gap-2">
        <span className="gc-stat-label">{messages.feedbackForm.message}</span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={2000}
          placeholder={messages.feedbackForm.messagePlaceholder}
          className="border border-[var(--hair)] bg-white p-3 text-sm leading-7 focus:border-[var(--orange)] focus:outline-none"
        />
      </label>
      <label className="grid gap-2">
        <span className="gc-stat-label">{messages.feedbackForm.contact}</span>
        <input
          name="contact"
          maxLength={160}
          placeholder={messages.feedbackForm.contactPlaceholder}
          className="min-h-11 border border-[var(--hair)] bg-white px-3 text-sm focus:border-[var(--orange)] focus:outline-none"
        />
      </label>
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {state === "error" ? (
        <p role="alert" className="border border-[var(--orange)] bg-[rgba(194,65,12,0.06)] p-3 text-sm">
          {messages.feedbackForm.error}
        </p>
      ) : null}
      <div>
        <button
          type="submit"
          disabled={state === "submitting"}
          className="gc-action gc-action-primary disabled:opacity-60"
        >
          {state === "submitting"
            ? messages.feedbackForm.submitting
            : messages.feedbackForm.submit}
        </button>
      </div>
      <p className="text-xs leading-5 text-[var(--muted)]">
        {messages.feedbackForm.privacy}
      </p>
    </form>
  );
}
