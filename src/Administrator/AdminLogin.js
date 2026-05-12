import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Footer, Header } from "../PageParts";
import { auth } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Page, PageHero } from "../components/page";

function AdminLogin() {
  const [command, setCommand] = useState("");
  const adminCommand = "iamkamekingdom";

  const getCurrentResult = () => {
    const normalized = command.toLowerCase();

    if (command === adminCommand) {
      return <ActionLink to="/adminhome" label="管理者画面" />;
    }
    if (normalized === "preview") {
      return <ActionLink to="/reservation-preview" label="予約プレビュー" />;
    }
    if (normalized === "reserve" || normalized === "reservation") {
      return <ActionLink to="/reservation" label="部室予約" />;
    }
    if (normalized === "calendar") {
      return <ActionLink to="/calendar" label="カレンダー" />;
    }
    if (normalized === "event") {
      return <ActionLink to="/notification" label="イベント" />;
    }
    if (normalized === "home") {
      return <ActionLink to="/" label="ホーム" />;
    }
    if (normalized === "tool") {
      return <ActionLink to="/tool" label="ツール" />;
    }
    if (normalized === "youtube") {
      return <ExternalAction href="https://www.youtube.com/channel/UCg9WNSATUeU8g5p2O4mHS_w" label="YouTube" />;
    }
    if (normalized === "instagram") {
      return <ExternalAction href="https://www.instagram.com/deepstreamksc/" label="Instagram" />;
    }
    if (normalized === "twitter") {
      return (
        <div className="space-y-3">
          <ExternalAction href="https://www.instagram.com/deepstreamksc/" label="Instagram" />
          <p className="text-sm text-muted-foreground">あ、間違えちゃった...</p>
        </div>
      );
    }
    if (normalized === "game") {
      return <p className="text-sm text-muted-foreground">現在開発中です。お楽しみに。</p>;
    }
    if (normalized === "hello") {
      return <p className="text-sm text-muted-foreground">こんにちは。{auth.currentUser?.displayName}さん</p>;
    }
    if (normalized === "good morning") {
      return <p className="text-sm text-muted-foreground">おはようござんす。{auth.currentUser?.displayName}さん</p>;
    }
    if (normalized === "good evening") {
      return <p className="text-sm text-muted-foreground">こんばんは。{auth.currentUser?.displayName}さん</p>;
    }
    if (normalized === "good night") {
      return <p className="text-sm text-muted-foreground">おやすみなさい。{auth.currentUser?.displayName}さん</p>;
    }
    if (normalized === "time") {
      const date = new Date();
      return (
        <p className="text-sm text-muted-foreground">
          現在時刻は {date.getHours()}時{date.getMinutes()}分です。
        </p>
      );
    }
    if (normalized === "kame" || normalized === "cmd" || normalized === "command") {
      return <p className="text-sm text-muted-foreground">遊び心で作ってみました。</p>;
    }
    return null;
  };

  return (
    <>
      <Header />
      <Page className="max-w-2xl">
        <PageHero
          eyebrow="Command"
          title="コマンド"
          description="運営ショートカットや隠し導線を、テキストコマンドから開けます。"
        />
        <Card>
          <CardHeader>
            <CardTitle>コマンド入力</CardTitle>
            <CardDescription>例: preview / reservation / calendar / tool</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="コマンドを入力" />
            {getCurrentResult()}
          </CardContent>
        </Card>
      </Page>
      <Footer />
    </>
  );
}

function ActionLink({ to, label }) {
  return (
    <Link to={to} className="block">
      <Button fullWidth>{label}</Button>
    </Link>
  );
}

function ExternalAction({ href, label }) {
  return (
    <a href={href} className="block">
      <Button fullWidth variant="secondary">
        {label}
      </Button>
    </a>
  );
}

export default AdminLogin;
