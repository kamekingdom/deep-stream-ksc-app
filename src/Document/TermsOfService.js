import React from "react";
import { Footer, Header } from "../PageParts";
import TermsOfUse from "./TermsOfUse";
import PrivacyPolicy from "./PrivacyPolicy";
import { Page, PageHero } from "../components/page";

function TermsOfService() {
  return (
    <>
      <Header />
      <Page>
        <PageHero
          eyebrow="Policies"
          title="利用規約とプライバシーポリシー"
          description="アプリケーションの利用条件と、取得する情報の扱いをまとめています。"
        />
        <div className="space-y-6">
          <TermsOfUse />
          <PrivacyPolicy />
        </div>
      </Page>
      <Footer />
    </>
  );
}

export default TermsOfService;
