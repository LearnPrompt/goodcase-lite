import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="gc-page-hero">
      <div className="gc-page-hero-copy">
        <p className="gc-eyebrow">{eyebrow}</p>
        <h1 className="gc-page-title">{title}</h1>
        <p className="gc-page-description">{description}</p>
      </div>
      {children ? <aside className="gc-hero-index">{children}</aside> : null}
    </section>
  );
}
