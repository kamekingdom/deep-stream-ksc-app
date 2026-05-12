import React from "react";
import { Button } from "./ui/button";
import { APP_BUILD_TIME } from "../generated/version";

const CHECK_INTERVAL_MS = 60 * 1000;

async function clearAppCaches() {
  if ("caches" in window) {
    const cacheKeys = await window.caches.keys();
    await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
  }

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }
}

async function fetchLatestVersion() {
  const response = await fetch(`/version.json?t=${Date.now()}`, {
    cache: "no-store",
    headers: {
      pragma: "no-cache",
      "cache-control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error("version-check-failed");
  }

  return response.json();
}

function UpdateBanner() {
  const [latestVersion, setLatestVersion] = React.useState(null);
  const [isReloading, setIsReloading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const checkVersion = async () => {
      try {
        const latest = await fetchLatestVersion();
        const hasNewBuild = latest?.buildTime && latest.buildTime !== APP_BUILD_TIME;

        if (!cancelled && hasNewBuild) {
          setLatestVersion(latest);
        }
      } catch (_error) {
        // Silent fail: lack of connectivity should not disturb normal app usage.
      }
    };

    checkVersion();
    const intervalId = window.setInterval(checkVersion, CHECK_INTERVAL_MS);

    const handleFocus = () => {
      checkVersion();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkVersion();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await clearAppCaches();
    } finally {
      window.location.replace(`/?updatedAt=${Date.now()}`);
    }
  };

  if (!latestVersion) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-[7.5rem] z-[140] border-b-2 border-primary/25 bg-background px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.12)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[1rem] font-bold text-foreground">アプリの更新があります</p>
          <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
            新しいバージョンが公開されています。再読み込みすると最新の画面に切り替わります。
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="min-w-[10rem]"
          onClick={handleReload}
          disabled={isReloading}
        >
          {isReloading ? "更新中..." : "再読み込み"}
        </Button>
      </div>
    </div>
  );
}

export default UpdateBanner;
