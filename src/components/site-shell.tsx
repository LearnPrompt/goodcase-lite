import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteShell({
  children,
  footerNote,
}: {
  children: ReactNode;
  footerNote?: string;
}) {
  return (
    <div className="mx-auto my-3 w-[calc(100%_-_12px)] max-w-[1440px] border border-[var(--hair)] bg-[rgba(250,250,247,0.92)] shadow-[0_48px_110px_-72px_rgba(10,10,10,0.75)] backdrop-blur-xl md:my-4 md:w-[calc(100%_-_24px)]">
      <SiteHeader />
      <main className="px-4 py-7 md:px-6 md:py-8">{children}</main>
      <SiteFooter note={footerNote} />
    </div>
  );
}
