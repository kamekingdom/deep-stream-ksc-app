import React from "react";
import { cn } from "../lib/utils";

function Page({ className, children }) {
  return (
    <main className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10", className)}>
      {children}
    </main>
  );
}

function PageHero({ eyebrow, title, description, actions, className }) {
  return (
    <section
      className={cn(
        "mb-8 rounded-[32px] border border-border/70 bg-card/85 p-6 shadow-soft backdrop-blur sm:p-8",
        className
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

function Section({ className, children }) {
  return (
    <section className={cn("rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-soft", className)}>
      {children}
    </section>
  );
}

function FieldStack({ className, children }) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export { Page, PageHero, Section, FieldStack };
