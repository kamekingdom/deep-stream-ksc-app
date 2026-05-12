import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

function TermsOfUse() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deep Stream アプリケーション利用規約</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          この利用規約は、関西学院大学軽音サークル「Deep Stream」が提供するアプリケーションの利用条件を定めるものです。ユーザーは本規約に同意した上で、本アプリケーションを利用してください。
        </p>
        <div>
          <p className="font-semibold text-foreground">1. 利用者情報の取得</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>メールアドレス</li>
            <li>氏名</li>
            <li>ニックネーム</li>
            <li>学籍番号</li>
          </ul>
        </div>
        <p>
          取得した情報は、プライバシーポリシーおよび個人情報保護に関する法令に従って適切に管理されます。
        </p>
        <div>
          <p className="font-semibold text-foreground">2. アプリケーションの利用</p>
          <p>部室予約、イベント確認、提出書類確認など、サークル活動に関する機能を提供します。</p>
          <p>営利目的での利用や第三者への情報提供は禁止します。</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">3. 規約の変更</p>
          <p>必要に応じて本規約を変更できるものとし、変更内容はアプリ内掲示をもって効力を生じます。</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">4. 免責事項</p>
          <p>本アプリケーションの利用により生じた損害について、当サークルは責任を負いません。</p>
          <p>予告なくサービスを中止または中断することがあります。</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">5. 知的財産権</p>
          <p>本アプリケーションに関する一切の知的財産権は当サークルに帰属します。</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">6. 準拠法および管轄</p>
          <p>本規約は日本法に準拠し、関西学院大学所在地を管轄する裁判所を専属的合意管轄とします。</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default TermsOfUse;
