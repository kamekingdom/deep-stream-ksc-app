import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

function PrivacyPolicy() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>プライバシーポリシー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          Deep Stream アプリケーションの利用において、当サークルはユーザーの個人情報を適切に取り扱うため、以下の方針を定めます。
        </p>
        <div>
          <p className="font-semibold text-foreground">1. 取得する情報</p>
          <p>メールアドレス、氏名、ニックネーム、学籍番号を取得します。</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">2. 利用目的</p>
          <p>機能提供、運営管理、重要連絡、サポート、匿名統計の作成と分析のために利用します。</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">3. 情報の共有</p>
          <p>第三者へ共有しません。ただし法令に基づく場合は必要な範囲で開示することがあります。</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">4. 保護と管理</p>
          <p>不正アクセス、紛失、改ざん、漏えいを防止するために適切な安全対策を講じます。</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">5. 外部リンク</p>
          <p>リンク先サービスにおけるデータ取扱いについて当サークルは責任を負いません。</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">6. お問い合わせ</p>
          <p>deepstream.ksc [ at ] gmail.com までご連絡ください。</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default PrivacyPolicy;
