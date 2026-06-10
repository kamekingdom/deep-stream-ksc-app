import React, { useEffect, useState } from "react";
import packageInfo from "../../package.json";
import { Footer, Header } from "../PageParts";
import useIsMobile from "../function/isMobile";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Page, PageHero } from "../components/page";

function HomePage() {
  const isMobile = useIsMobile();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShow(false);
    }, 1800);

    return () => clearTimeout(timeoutId);
  }, []);

  if (show) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-sm rounded-[32px] border border-border/80 bg-card p-8 text-center shadow-soft">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[28px] bg-secondary p-4">
            <img src="/DeepStreamICON.jpg" alt="Deep Stream" className="rounded-[20px]" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">KSC App</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Deep Stream</h1>
          <p className="mt-3 text-base text-muted-foreground">Version {packageInfo.version}</p>
        </div>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <Page className="flex min-h-screen items-center justify-center">
        <Card className="max-w-xl text-center">
          <CardContent className="space-y-5 p-8">
            <h2 className="text-3xl font-black">スマートフォンからアクセスしてください</h2>
            <p className="text-base leading-8 text-muted-foreground">
              このアプリはモバイルでの利用を前提に再設計されています。スマートフォンから開くと、予約や確認フローが最も使いやすい表示になります。
            </p>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <>
      <Header />
      <Page>
        <PageHero
          eyebrow="Deep Stream"
          title="軽音サークルの運営を、ひとつのアプリに。"
          description="部室利用、予約、設定を、スマートフォンで見やすいサイズと導線に整理しました。"
          actions={
            <a href="/reservation" className="block">
              <Button size="lg" className="w-full sm:w-auto">部室予約</Button>
            </a>
          }
        />
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
          <FeatureCard
            title="部室利用"
            description="現在の鍵の状態や利用状況を、すばやく確認できます。"
          />
          <FeatureCard
            title="部室予約"
            description="曜日・時間帯ごとに予約状況を見ながら、そのまま申請できます。"
          />
          <FeatureCard
            title="設定"
            description="登録情報の確認や各種リンクを、ひとつの場所にまとめています。"
          />
        </div>
      </Page>
      <Footer />
    </>
  );
}

function FeatureCard({ title, description }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <h3 className="text-2xl font-bold leading-tight">{title}</h3>
        <p className="text-base leading-8 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default HomePage;
