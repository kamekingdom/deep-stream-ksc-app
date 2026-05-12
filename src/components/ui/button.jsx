import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:opacity-90",
        secondary:
          "bg-accent text-accent-foreground hover:bg-primary/15",
        outline:
          "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-red-800",
      },
      size: {
        default: "h-12 px-6 text-lg",
        sm: "h-11 px-4 text-base",
        lg: "h-14 px-7 text-xl",
        icon: "h-12 w-12 rounded-xl",
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
