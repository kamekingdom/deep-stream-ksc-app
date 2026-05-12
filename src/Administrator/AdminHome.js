import React from "react";
import { Link } from "react-router-dom";
import { Footer, Header } from "../PageParts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";

const actions = [
  { label: "提出書類作成", to: "/admineventpost" },
  { label: "イベント作成", to: "/adminschedulepost" },
  { label: "緊急予約", to: "/create-reservation-settings" },
  { label: "予約テンプレ", to: "/create-reservation-template" },
];

function AdminHome() {
  return (
    <>
      <Header />
      <Page>
        <PageHero
          eyebrow="Admin"
          title="開発者画面"
          description="運営用の投稿と予約設定を、ここからまとめて操作できます。"
        />
        <Card>
          <CardHeader>
            <CardTitle>管理メニュー</CardTitle>
            <CardDescription>よく使う運営機能をショートカット化しています。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {actions.map((action) => (
              <Link key={action.to} to={action.to} className="block">
                <Button fullWidth className="h-14 rounded-3xl">
                  {action.label}
                </Button>
              </Link>
            ))}
            <a href="https://github.com/DeepStream-KSC/deepstreamksc" className="block">
              <Button fullWidth variant="secondary" className="h-14 rounded-3xl">
                ソースコード
              </Button>
            </a>
          </CardContent>
        </Card>
      </Page>
      <Footer />
    </>
  );
}

export default AdminHome;
