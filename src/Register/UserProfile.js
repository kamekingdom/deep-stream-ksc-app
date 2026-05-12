import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Header } from "../PageParts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Page } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import { getCurrentUserEmail, useCurrentUser } from "../lib/session-auth";

function UserProfile() {
  const [user] = useCurrentUser();
  const [profile, setProfile] = useState(null);
  const firestore = getFirestore();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user && !profile) {
        const userDocRef = doc(firestore, "users", getCurrentUserEmail());
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        }
      }
    };

    fetchProfileData();
  }, [user, profile, firestore]);

  return (
    <div>
      <Header />
      <Page className="max-w-2xl">
        {!profile ? (
          <Spinner label="プロフィールを読み込んでいます..." />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>プロフィール情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ProfileField label="メールアドレス" value={user?.email || ""} />
              <ProfileField label="学籍番号" value={profile.StudentNumber} />
              <ProfileField label="氏名" value={profile.PersonalName} />
              <ProfileField label="ニックネーム" value={profile.NickName} />
              <Link to="/" className="block">
                <Button fullWidth>ホーム</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </Page>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <Textarea readOnly value={value} className="min-h-[72px] resize-none" />
    </div>
  );
}

export default UserProfile;
