import React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-b border-border/80 bg-transparent text-card-foreground shadow-none",
      className
    )}
    {...props}
  />
));

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-3 px-0 py-5 sm:py-6", className)} {...props} />
));

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[1.6rem] font-semibold tracking-tight text-foreground/95 sm:text-[1.95rem]", className)}
    {...props}
  />
));

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-base leading-7 text-muted-foreground sm:text-lg", className)} {...props} />
));

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-0 pb-5 pt-0 sm:pb-6", className)} {...props} />
));

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center px-0 pb-5 pt-0 sm:pb-6", className)} {...props} />
));

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
