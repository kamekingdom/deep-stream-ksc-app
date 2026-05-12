import React from "react";
import { Link } from "react-router-dom";
import { Footer, Header } from "../PageParts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";

const toolLinks = [
  { label: "コマンド", to: "/adminlogin", internal: true },
  { label: "資料", to: "https://1drv.ms/f/s!AtMlHWLLja-6f3QqsYbzs7NejHc?e=cZDkyF" },
  { label: "お問い合わせ", to: "https://forms.gle/MPeRmvmbRJRzjQD48" },
];

function Tool() {
  return (
    <>
      <Header />
      <Page>
        <PageHero
          eyebrow="Toolbox"
          title="ツール"
          description="運営メンバー向けの導線や資料リンクを、ひとつの場所から開けます。"
        />
        <Card>
          <CardHeader>
            <CardTitle>ショートカット</CardTitle>
            <CardDescription>よく使う外部リンクと管理画面への入口です。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {toolLinks.map((item) =>
              item.internal ? (
                <Link key={item.label} to={item.to} className="block">
                  <Button fullWidth className="h-14 rounded-3xl">
                    {item.label}
                  </Button>
                </Link>
              ) : (
                <a key={item.label} href={item.to} className="block">
                  <Button fullWidth variant="secondary" className="h-14 rounded-3xl">
                    {item.label}
                  </Button>
                </a>
              )
            )}
          </CardContent>
        </Card>
      </Page>
      <Footer />
    </>
  );
}

export default Tool;
