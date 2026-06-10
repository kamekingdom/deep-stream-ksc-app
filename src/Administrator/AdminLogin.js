import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { Footer, Header } from "../PageParts";
import { db } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { PasswordInput } from "../components/ui/password-input";
import { Page, PageHero } from "../components/page";
import {
  authorizeAdmin,
  clearAdminAuthorization,
  isAdminAuthorized,
} from "../lib/admin";

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorized, setAuthorized] = useState(isAdminAuthorized());

  const fetchAdminPassword = async () => {
    const adminDoc = await getDoc(doc(db, "Setting", "Admin"));

    if (!adminDoc.exists()) {
      return "";
    }

    const adminData = adminDoc.data();
    return adminData.Password || adminData.password || adminData.AdminPassword || "";
  };

  const handleUnlock = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const adminPassword = await fetchAdminPassword();

      if (!adminPassword) {
        setError("管理者パスワードが Firestore に設定されていません。");
        return;
      }

      if (password !== adminPassword) {
        setError("パスワードが違います。");
        return;
      }

      authorizeAdmin();
      setAuthorized(true);
      navigate("/adminhome");
    } catch (fetchError) {
      setError("パスワード確認に失敗しました。通信状況をご確認ください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAdmin = () => {
    clearAdminAuthorization();
    setAuthorized(false);
    setPassword("");
  };

  return (
    <>
      <Header />
      <Page>
        <PageHero title="管理者" />
        <div className="mx-auto w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>{authorized ? "管理モード有効" : "パスワード入力"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {authorized ? (
                <>
                  <Link to="/adminhome" className="block">
                    <Button fullWidth size="lg">
                      管理画面を開く
                    </Button>
                  </Link>
                  <Button fullWidth size="lg" variant="secondary" onClick={handleLogoutAdmin}>
                    管理モードを終了
                  </Button>
                </>
              ) : (
                <form className="space-y-4" onSubmit={handleUnlock}>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="管理者パスワード"
                    className="h-14 rounded-xl text-xl"
                  />
                  {error ? <p className="text-base font-medium text-destructive">{error}</p> : null}
                  <Button fullWidth size="lg" type="submit" disabled={!password || isSubmitting}>
                    {isSubmitting ? "確認中..." : "ログイン"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          {!authorized ? (
            <Card>
              <CardHeader>
                <CardTitle>開発者連絡先</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-base text-muted-foreground">
                  困ったことや不具合があれば、開発者までお気軽にご連絡ください。
                </p>
                <div className="space-y-2">
                  <a
                    href="https://www.instagram.com/kamekingdom/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex text-[1rem] font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Instagram: @kamekingdom
                  </a>
                  <a
                    href="https://kame-tech-lab.web.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex text-[1rem] font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    ホームページ: kame-tech-lab.web.app
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </Page>
      <Footer />
    </>
  );
}

export default AdminLogin;
