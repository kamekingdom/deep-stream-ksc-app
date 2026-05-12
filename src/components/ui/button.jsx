import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-sky-600",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-slate-200",
        outline:
          "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-rose-600",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 rounded-full",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
