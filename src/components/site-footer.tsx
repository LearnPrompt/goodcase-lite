"use client";

import { LocalizedLink as Link } from "@/components/localized-link";
import { useMessages } from "@/i18n/client";

export function SiteFooter({ note }: { note?: string }) {
  const messages = useMessages();

  return (
    <footer className="grid gap-3 border-t border-[var(--hair)] bg-[var(--paper-2)] px-4 py-5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted)] md:grid-cols-[auto_1fr_auto] md:items-center md:px-6">
      <span className="text-[var(--ink)]">{messages.site.footerBrand}</span>
      {note ? <span className="md:text-right">{note}</span> : null}
      <nav className="flex gap-4 md:justify-end" aria-label={messages.nav.ariaLabel}>
        <Link className="hover:text-[var(--ink)]" href="/changelog">
          {messages.nav.changelog}
        </Link>
        <Link className="hover:text-[var(--ink)]" href="/connect#feedback">
          {messages.nav.feedback}
        </Link>
      </nav>
    </footer>
  );
}
