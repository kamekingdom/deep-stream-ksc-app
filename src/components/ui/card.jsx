import React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[28px] border border-border/70 bg-card/95 text-card-foreground shadow-soft backdrop-blur",
      className
    )}
    {...props}
  />
));

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2 p-6", className)} {...props} />
));

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xl font-semibold tracking-tight", className)}
    {...props}
  />
));

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
