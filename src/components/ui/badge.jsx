import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-14 w-full items-center justify-center rounded-xl border px-2 py-3 text-[1.05rem] font-semibold leading-tight tracking-tight transition-colors sm:text-[1.2rem]",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-accent text-foreground",
        secondary: "border-primary/20 bg-primary/10 text-foreground",
        outline: "border-border bg-background text-foreground",
        destructive: "border-destructive/20 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
