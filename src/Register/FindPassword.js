import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { Header } from "../PageParts";
import { auth } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Page } from "../components/page";

export default function FindPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const sendResetEmail = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("パスワードリセットメールを送信しました。メールを確認してください。");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <Header />
      <Page className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>パスワードを忘れた場合</CardTitle>
            <CardDescription>登録済みメールアドレスに再設定用メールを送信します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="email" placeholder="メールアドレスを入力" onChange={(e) => setEmail(e.target.value)} />
            <Button fullWidth onClick={sendResetEmail} disabled={!email}>
              送信
            </Button>
          </CardContent>
        </Card>
      </Page>
    </div>
  );
}
