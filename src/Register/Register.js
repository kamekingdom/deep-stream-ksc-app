import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, query, collection, where, getDocs } from "firebase/firestore";
import { Header } from "../PageParts";
import { auth } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { PasswordInput } from "../components/ui/password-input";
import { Page } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import { defaultAppearance, serializeAppearanceForFirestore } from "../lib/appearance";
import { useCurrentUser } from "../lib/session-auth";

function Register() {
  const [user] = useCurrentUser();

  return (
    <div>
      <Helmet>
        <title>会員登録</title>
      </Helmet>
      <Header />
      <Page className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>会員登録</CardTitle>
            <CardDescription>
              {user
                ? "別アカウントを登録する場合はログアウト後に進めてください。"
                : "関学メールで Deep Stream のアカウントを作成します。"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <EmailRegister />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                アカウントをお持ちの方は{" "}
                <Link to="/login" className="font-semibold text-primary">
                  ログイン
                </Link>
              </p>
              <p>
                利用規約は{" "}
                <Link to="/termsofservice" className="font-semibold text-primary">
                  こちら
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </Page>
    </div>
  );
}

function EmailRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [personalName, setPersonalName] = useState("");
  const [personalNameKana, setPersonalNameKana] = useState("");
  const [nickname, setNickname] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [error, setError] = useState("");
  const [isAlreadyUploaded, setIsAlreadyUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = getFirestore();
  const normalizedEmail = email.trim().toLowerCase();

  const isStudentNumberExists = async (value) => {
    const studentNumberRef = query(
      collection(firestore, "users"),
      where("StudentNumber", "==", value)
    );
    const studentNumberSnapshot = await getDocs(studentNumberRef);
    return !studentNumberSnapshot.empty;
  };

  const isNicknameExists = async (value) => {
    const nicknameRef = query(collection(firestore, "users"), where("NickName", "==", value));
    const nicknameSnapshot = await getDocs(nicknameRef);
    return !nicknameSnapshot.empty;
  };

  const validateKatakana = (str) => /^[\u30A0-\u30FF\s]+$/.test(str);
  const validateStudentNumber = (str) => /^\d{8}$/.test(str);

  const resetForm = () => {
    setError("");
    setIsSubmitting(false);
    setIsAlreadyUploaded(false);
  };

  const registerWithEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setIsAlreadyUploaded(false);
    setIsSubmitting(true);

    if (!validateKatakana(personalNameKana)) {
      setError("氏名(カタカナ)はカタカナで入力してください");
      setIsSubmitting(false);
      return;
    }

    if (!validateStudentNumber(studentNumber)) {
      setError("学籍番号は8桁の半角数字で入力してください");
      setIsSubmitting(false);
      return;
    }

    if (await isStudentNumberExists(studentNumber)) {
      setError("この学籍番号は既に登録されています");
      setIsSubmitting(false);
      return;
    }

    if (await isNicknameExists(nickname)) {
      setError("このニックネームは既に登録されています");
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const userId = userCredential.user.uid;
      const userDocRef = doc(firestore, "users", normalizedEmail);
      await setDoc(userDocRef, {
        PersonalName: personalName,
        PersonalNameFurigana: personalNameKana,
        StudentNumber: studentNumber,
        NickName: nickname,
        Password: password,
        userId,
        ReservationNum: 0,
        ...serializeAppearanceForFirestore(defaultAppearance),
      });
      setIsAlreadyUploaded(true);
    } catch (firebaseError) {
      setError(translateFirebaseError(firebaseError.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={registerWithEmail}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          type="email"
          placeholder="メールアドレス(関学用)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          placeholder="氏名(漢字)"
          value={personalName}
          onChange={(e) => setPersonalName(e.target.value)}
        />
        <Input
          placeholder="氏名(カタカナ)"
          value={personalNameKana}
          onChange={(e) => setPersonalNameKana(e.target.value)}
        />
        <Input
          placeholder="ニックネーム"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <Input
          placeholder="学籍番号"
          value={studentNumber}
          onChange={(e) => setStudentNumber(e.target.value)}
        />
      </div>

      {isSubmitting ? <Spinner className="py-4" label="登録しています..." /> : null}

      {!isSubmitting && !isAlreadyUploaded ? (
        <Button
          type="submit"
          fullWidth
          disabled={!email || !password || !personalName || !personalNameKana || !nickname || !studentNumber}
        >
          登録
        </Button>
      ) : null}

      {isAlreadyUploaded ? (
        <Link to="/" className="block">
          <Button fullWidth>ホームへ</Button>
        </Link>
      ) : null}

      {error ? (
        <div className="space-y-3 rounded-3xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button type="button" variant="outline" onClick={resetForm}>
            修正する
          </Button>
        </div>
      ) : null}
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

export default Register;
