import React from "react";
import { cn } from "../../lib/utils";

function Spinner({ className, label = "Loading..." }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-10", className)}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export { Spinner };
