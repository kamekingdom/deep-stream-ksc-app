import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { CalendarDays, FileText, Home, KeyRound, UserCircle2, Wrench } from "lucide-react";
import { auth } from "./firebase";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";

const navItems = [
  { label: "部室利用", to: "/key", fallback: "/login", icon: KeyRound },
  { label: "部室予約", to: "/reservation", fallback: "/login", icon: CalendarDays },
  { label: "提出書類", to: "/notification", fallback: "/login", icon: FileText },
  { label: "ツール", to: "/tool", fallback: "/login", icon: Wrench },
];

function Header() {
  const [user] = useAuthState(auth);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 text-foreground">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              KSC App
            </p>
            <p className="text-lg font-bold">Deep Stream</p>
          </div>
        </Link>
        <Link to="/login">
          <Button variant={user ? "secondary" : "default"} size="sm">
            <UserCircle2 className="h-4 w-4" />
            {user ? "アカウント" : "ログイン"}
          </Button>
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  const [user] = useAuthState(auth);
  const location = useLocation();

  return (
    <>
      <div className="h-24" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-3 pb-3 pt-2 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-[28px] border border-border/70 bg-card/90 px-2 py-2 shadow-soft">
          {navItems.map((item) => {
            const Icon = item.icon;
            const to = user ? item.to : item.fallback;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={to}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Copyright © 2024 KameKingdom & Sunghwa. All Rights Reserved.
        </p>
      </div>
    </>
  );
}

export { Header, Footer };
