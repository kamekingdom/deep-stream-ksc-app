import React from "react";
import { Link } from "react-router-dom";
import { Footer, Header } from "../PageParts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";

const actions = [
  { label: "予約不可設定", to: "/create-reservation-settings" },
];

function AdminHome() {
  return (
    <>
      <Header />
      <Page className="max-w-2xl">
        <PageHero
          title="管理者"
        />
        <Card>
          <CardHeader>
            <CardTitle>管理メニュー</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {actions.map((action) => (
              <Link key={action.to} to={action.to} className="block">
                <Button fullWidth>
                  {action.label}
                </Button>
              </Link>
            ))}
            <a href="https://github.com/DeepStream-KSC/deepstreamksc" className="block">
              <Button fullWidth variant="secondary">
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
