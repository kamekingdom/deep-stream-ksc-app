import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Header } from "../PageParts";
import { auth } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Page } from "../components/page";
import { Spinner } from "../components/ui/spinner";

function Login() {
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Helmet>
        <title>ログイン</title>
      </Helmet>
      <Header />
      <Page className="max-w-xl">
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
            {user ? (
              <div className="space-y-3">
                <Link to="/userprofile" className="block">
                  <Button fullWidth>登録情報</Button>
                </Link>
                <Link to="/" className="block">
                  <Button fullWidth variant="secondary">
                    ホーム
                  </Button>
                </Link>
                <Button fullWidth variant="outline" onClick={handleLogout}>
                  ログアウト
                </Button>
              </div>
            ) : (
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
            )}
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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(translateFirebaseError(error.code));
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
    "auth/email-already-in-use": "このメールアドレスは既に使用されています",
    "auth/invalid-email": "メールアドレスが無効です",
    "auth/operation-not-allowed": "メール/パスワード認証が無効です",
    "auth/weak-password": "パスワードが弱すぎます",
    "auth/user-disabled": "このアカウントは無効です",
    "auth/user-not-found": "ユーザーが見つかりません",
    "auth/wrong-password": "パスワードが間違っています",
  };

  return errorMessages[errorCode] || "予期しないエラーが発生しました";
}

export default Login;
