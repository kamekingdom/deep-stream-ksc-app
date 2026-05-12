import React from "react";
import { cn } from "../lib/utils";

function Page({ className, children }) {
  return (
    <main className={cn("mx-auto w-full max-w-2xl px-4 py-3 pb-28 sm:px-6 sm:py-4 sm:pb-32", className)}>
      {children}
    </main>
  );
}

function PageHero({ title, actions, className }) {
  return (
    <section
      className={cn(
        "mb-4 border-b border-border/80 bg-transparent py-4 sm:mb-5 sm:py-5",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[2.15rem] font-bold leading-tight tracking-tight text-foreground sm:text-[2.6rem]">
            {title}
          </h1>
        </div>
        {actions ? <div className="flex flex-wrap gap-3 max-sm:flex-col">{actions}</div> : null}
      </div>
    </section>
  );
}

function Section({ className, children }) {
  return (
    <section className={cn("border-b border-border/70 bg-transparent py-6", className)}>
      {children}
    </section>
  );
}

function FieldStack({ className, children }) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export { Page, PageHero, Section, FieldStack };
