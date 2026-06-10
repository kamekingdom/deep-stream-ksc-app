import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "./input";

const PasswordInput = React.forwardRef(({ className, disabled, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;
  const label = isVisible ? "パスワードを非表示" : "パスワードを表示";

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={isVisible ? "text" : "password"}
        disabled={disabled}
        className={cn("pr-12", className)}
        {...props}
      />
      <button
        type="button"
        aria-label={label}
        title={label}
        disabled={disabled}
        onClick={() => setIsVisible((value) => !value)}
        className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <Icon aria-hidden="true" size={20} strokeWidth={2} />
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
