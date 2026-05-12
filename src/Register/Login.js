import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, Navigate } from "react-router-dom";
import { Header } from "../PageParts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Page } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import { loginWithEmailFallback, useCurrentUser } from "../lib/session-auth";

function Login() {
  const [user] = useCurrentUser();

  if (user) {
    return <Navigate to="/reservation" replace />;
  }

  return (
    <div>
      <Helmet>
        <title>ログイン</title>
      </Helmet>
      <Header />
      <Page className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{user ? "アカウント" : "ログイン"}</CardTitle>
            <CardDescription>
              {user
                ? "登録情報の確認やログアウトができます。"
                : "Deep Stream の各機能を使うにはログインが必要です。"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <>
              <EmailLogin />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  未登録の方は{" "}
                  <Link to="/register" className="font-semibold text-primary">
                    会員登録
                  </Link>
                </p>
                <p>
                  利用規約は{" "}
                  <Link to="/termsofservice" className="font-semibold text-primary">
                    こちら
                  </Link>
                </p>
                <p>
                  パスワードを忘れた場合は{" "}
                  <Link to="/findpassword" className="font-semibold text-primary">
                    こちら
                  </Link>
                </p>
              </div>
            </>
          </CardContent>
        </Card>
      </Page>
    </div>
  );
}

function EmailLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginWithEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithEmailFallback(email, password);
    } catch (error) {
      console.error("Fallback login failed:", error);
      setError(translateFirebaseError(error?.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={loginWithEmail}>
      <Input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {isSubmitting ? <Spinner className="py-4" label="認証中です..." /> : null}
      {!isSubmitting ? (
        <Button type="submit" fullWidth disabled={!email || !password}>
          ログイン
        </Button>
      ) : null}
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
    </form>
  );
}

function translateFirebaseError(errorCode) {
  const errorMessages = {
    "auth/firestore-timeout": "ログイン情報の確認に時間がかかっています。Firestore へ接続できていない可能性があります",
    "auth/persistence-timeout": "端末の認証設定に時間がかかっています。もう一度お試しください",
    "auth/request-timeout": "認証に時間がかかっています。通信状態を確認して、もう一度お試しください",
    "auth/network-request-failed": "通信に失敗しました。時間をおいてもう一度お試しください",
    "auth/internal-error": "認証の内部エラーが発生しました。ブラウザを変えるか、時間をおいてお試しください",
    "auth/too-many-requests": "試行回数が多いため一時的に制限されています。時間をおいてお試しください",
    "auth/invalid-credential": "メールアドレスまたはパスワードが正しくありません",
    "auth/email-already-in-use": "このメールアドレスは既に使用されています",
    "auth/invalid-email": "メールアドレスが無効です",
    "auth/operation-not-allowed": "メール/パスワード認証が無効です",
    "auth/weak-password": "パスワードが弱すぎます",
    "auth/user-disabled": "このアカウントは無効です",
    "auth/user-not-found": "ユーザーが見つかりません",
    "auth/wrong-password": "パスワードが間違っています",
  };

  if (errorCode) {
    return errorMessages[errorCode] || `ログインに失敗しました (${errorCode})`;
  }

  return "ログインに失敗しました。通信環境かブラウザ設定をご確認ください";
}
export default Login;
