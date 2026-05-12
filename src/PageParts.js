import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarDays, KeyRound, Settings2, Shield, UserRound } from "lucide-react";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import {
  APPEARANCE_EVENT,
  getIconColorOption,
  getIconOption,
  readStoredAppearance,
} from "./lib/appearance";
import { APP_VERSION } from "./generated/version";
import { useCurrentUser } from "./lib/session-auth";

const navItems = [
  { label: "部室予約", to: "/reservation", fallback: "/login", icon: CalendarDays },
  { label: "部室利用", to: "/key", fallback: "/login", icon: KeyRound },
  { label: "設定", to: "/tool", fallback: "/login", icon: Settings2 },
  { label: "管理者", to: "/adminlogin", fallback: "/adminlogin", icon: Shield, admin: true },
];

function Header() {
  const [user] = useCurrentUser();
  const [appearance, setAppearance] = React.useState(readStoredAppearance());

  React.useEffect(() => {
    const syncAppearance = () => {
      setAppearance(readStoredAppearance());
    };

    window.addEventListener(APPEARANCE_EVENT, syncAppearance);
    return () => window.removeEventListener(APPEARANCE_EVENT, syncAppearance);
  }, []);

  const AccountIcon = getIconOption(appearance.profileIcon).icon;
  const accountIconColor = getIconColorOption(appearance.profileIconColor).value;

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-border/80 bg-background">
      <div className="mx-auto flex h-[7.5rem] w-full max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link to="/reservation" className="flex flex-col">
          <span className="brand-wordmark text-[2.4rem] leading-none text-foreground">Deep Stream</span>
          <span className="mt-2 text-[0.9rem] font-semibold tracking-[0.08em] text-muted-foreground">
            Version {APP_VERSION}
          </span>
        </Link>
        <Link to={user ? "/tool" : "/login"}>
          {user ? (
            <Button
              variant="secondary"
              size="icon"
              className="h-16 w-16 rounded-full border border-border bg-accent"
              aria-label="アカウント"
            >
              <AccountIcon className="h-8 w-8" style={{ color: accountIconColor }} strokeWidth={2.2} />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="icon"
              className="h-16 w-16 rounded-full border border-border bg-accent text-muted-foreground"
              aria-label="アカウント"
            >
              <UserRound className="h-8 w-8" strokeWidth={2.2} />
            </Button>
          )}
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  const [user] = useCurrentUser();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  return (
    <>
      <div className="h-36" />
      <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-border/80 bg-background pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto grid max-w-4xl grid-cols-4 border-b border-border/70 px-2 pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const to = user ? item.to : item.fallback;
            const isActive = item.admin
              ? location.pathname.startsWith("/admin")
              || location.pathname.startsWith("/create-reservation")
              || location.pathname.startsWith("/reservation-check")
              || location.pathname.startsWith("/fix-time-slots")
              : location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={to}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-1.5 px-1 py-3 text-[1.2rem] font-semibold transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-[1.4rem] w-[1.4rem]" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[0.8rem] text-muted-foreground">
          Copyright © {currentYear}{" "}
          <a
            href="https://kame-tech-lab.web.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            KameKingdom
          </a>
          . All Rights Reserved.
        </p>
      </div>
    </>
  );
}

export { Header, Footer };
