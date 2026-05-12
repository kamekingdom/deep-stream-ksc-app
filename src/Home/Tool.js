import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { Footer, Header } from "../PageParts";
import { auth, db } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Page, PageHero } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import {
  applyAppearanceToDocument,
  defaultAppearance,
  dispatchAppearanceChange,
  getIconColorOption,
  getIconOption,
  getThemeOption,
  iconColorOptions,
  iconOptions,
  serializeAppearanceForFirestore,
  sanitizeAppearance,
  themeOptions,
  writeStoredAppearance,
} from "../lib/appearance";
import {
  canUseNotifications,
  getNotificationPermission,
  requestNotificationPermission,
} from "../lib/notifications";
import { clearManualSession, signOutCurrentUser, useCurrentUser } from "../lib/session-auth";

const quickLinks = [
  { label: "資料", to: "https://1drv.ms/f/s!AtMlHWLLja-6f3QqsYbzs7NejHc?e=cZDkyF" },
  { label: "お問い合わせ", to: "https://forms.gle/MPeRmvmbRJRzjQD48" },
];

function Tool() {
  const navigate = useNavigate();
  const [user] = useCurrentUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());
  const [profileMessage, setProfileMessage] = useState("");
  const [appearance, setAppearance] = useState(defaultAppearance);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAppearanceEditorOpen, setIsAppearanceEditorOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    studentNumber: "",
    personalName: "",
    nickName: "",
  });

  useEffect(() => {
    const syncNotificationPermission = () => {
      setNotificationPermission(getNotificationPermission());
    };

    syncNotificationPermission();
    window.addEventListener("focus", syncNotificationPermission);
    document.addEventListener("visibilitychange", syncNotificationPermission);

    return () => {
      window.removeEventListener("focus", syncNotificationPermission);
      document.removeEventListener("visibilitychange", syncNotificationPermission);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      if (!user?.email) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", user.email));

      if (!mounted) {
        return;
      }

      const nextProfile = userDoc.exists() ? userDoc.data() : null;
      setProfile(nextProfile);
      setAppearance(sanitizeAppearance(nextProfile || defaultAppearance));
      setFormValues({
        studentNumber: nextProfile?.StudentNumber || "",
        personalName: nextProfile?.PersonalName || "",
        nickName: nextProfile?.NickName || "",
      });
      setLoading(false);
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    applyAppearanceToDocument(appearance);
  }, [appearance, user]);

  const handleAppearanceChange = (key, value) => {
    setProfileMessage("");
    setAppearance((current) => sanitizeAppearance({ ...current, [key]: value }));
  };

  const handleFormChange = (key, value) => {
    setProfileMessage("");
    setFormValues((current) => ({ ...current, [key]: value }));
  };

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    setIsAppearanceEditorOpen(false);
    setProfileMessage("");
    setFormValues({
      studentNumber: profile?.StudentNumber || "",
      personalName: profile?.PersonalName || "",
      nickName: profile?.NickName || "",
    });
    setAppearance(sanitizeAppearance(profile || defaultAppearance));
  };

  const handleSaveProfile = async () => {
    if (!user?.email) {
      return;
    }

    setSavingProfile(true);
    setProfileMessage("");
    const nextAppearance = sanitizeAppearance(appearance);

    try {
      await setDoc(
        doc(db, "users", user.email),
        {
          StudentNumber: formValues.studentNumber,
          PersonalName: formValues.personalName,
          NickName: formValues.nickName,
          ...serializeAppearanceForFirestore(nextAppearance),
        },
        { merge: true }
      );

      const nextProfile = {
        ...(profile || {}),
        StudentNumber: formValues.studentNumber,
        PersonalName: formValues.personalName,
        NickName: formValues.nickName,
        ThemeId: nextAppearance.themeId,
        ProfileIcon: nextAppearance.profileIcon,
        ProfileIconColor: nextAppearance.profileIconColor,
      };
      setProfile(nextProfile);
      writeStoredAppearance(nextAppearance);
      applyAppearanceToDocument(nextAppearance);
      dispatchAppearanceChange();
      setIsEditingProfile(false);
      setIsAppearanceEditorOpen(false);
      setProfileMessage("アカウント情報を保存しました。");
    } catch (error) {
      setProfileMessage("保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSavingProfile(false);
    }
  };

  const previewIcon = getIconOption(appearance.profileIcon).icon;
  const previewColor = getIconColorOption(appearance.profileIconColor).value;
  const previewTheme = getThemeOption(appearance.themeId);
  const PreviewIcon = previewIcon;

  const handleLogout = async () => {
    setProfileMessage("");
    setIsLoggingOut(true);

    try {
      await signOutCurrentUser();
      navigate("/login");
    } catch (error) {
      setProfileMessage("ログアウトに失敗しました。");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  };

  const handleDeleteAccount = async () => {
    if (!user?.email) {
      return;
    }

    const confirmed = window.confirm("アカウントを削除します。よろしいですか？");
    if (!confirmed) {
      return;
    }

    setProfileMessage("");
    setIsDeletingAccount(true);

    try {
      if (auth.currentUser) {
        const currentUser = auth.currentUser;
        await deleteUser(currentUser);
      } else {
        clearManualSession();
      }

      try {
        await deleteDoc(doc(db, "users", user.email));
      } catch (deleteDocError) {
        console.error(deleteDocError);
      }

      navigate("/register");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setProfileMessage("アカウント削除には再ログインが必要です。いったんログアウトしてから再度お試しください。");
      } else {
        setProfileMessage("アカウント削除に失敗しました。");
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      <Header />
      <Page className="max-w-2xl">
        <PageHero title="設定" />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>アカウント情報</CardTitle>
                {user && !loading ? (
                  isEditingProfile ? (
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={handleCancelProfileEdit}>
                        キャンセル
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={savingProfile}>
                        {savingProfile ? "保存中..." : "保存"}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditingProfile(true)}>編集</Button>
                  )
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user ? (
                <>
                  <p className="text-lg text-muted-foreground">登録情報を見るにはログインしてください。</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link to="/login" className="block">
                      <Button fullWidth>ログイン</Button>
                    </Link>
                    <Link to="/register" className="block">
                      <Button fullWidth variant="secondary">会員登録</Button>
                    </Link>
                  </div>
                </>
              ) : loading ? (
                <Spinner label="登録情報を読み込んでいます..." />
              ) : (
                <div className="space-y-1">
                  {isEditingProfile ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsAppearanceEditorOpen((current) => !current)}
                        className="flex w-full items-center justify-between border-b border-border/70 py-4 text-left last:border-b-0"
                      >
                        <div>
                          <p className="text-base font-semibold text-muted-foreground">プロフィールアイコン</p>
                          <p className="mt-2 text-[1.2rem] font-semibold text-foreground">タップして変更</p>
                        </div>
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${previewTheme.preview}20`, color: previewColor }}
                        >
                          <PreviewIcon className="h-7 w-7" strokeWidth={2.2} />
                        </div>
                      </button>
                      {isAppearanceEditorOpen ? (
                        <div className="space-y-6 border-b border-border/70 py-4">
                          <div className="space-y-3">
                            <p className="text-base font-semibold text-muted-foreground">アイコン</p>
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                              {iconOptions.map((option) => {
                                const Icon = option.icon;
                                const selected = appearance.profileIcon === option.id;

                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleAppearanceChange("profileIcon", option.id)}
                                    className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-base font-semibold transition-colors ${
                                      selected ? "border-primary bg-accent text-foreground" : "border-border text-muted-foreground"
                                    }`}
                                  >
                                    <Icon className="h-7 w-7" strokeWidth={2.2} />
                                    <span>{option.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="text-base font-semibold text-muted-foreground">アイコンカラー</p>
                            <div className="flex flex-wrap gap-3">
                              {iconColorOptions.map((option) => {
                                const selected = appearance.profileIconColor === option.id;

                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleAppearanceChange("profileIconColor", option.id)}
                                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-base font-semibold ${
                                      selected ? "border-primary text-foreground" : "border-border text-muted-foreground"
                                    }`}
                                  >
                                    <span
                                      className="h-5 w-5 rounded-full border border-black/10"
                                      style={{ backgroundColor: option.value }}
                                    />
                                    {option.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="border-b border-border/70 py-4 last:border-b-0">
                      <p className="text-base font-semibold text-muted-foreground">プロフィールアイコン</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${previewTheme.preview}20`, color: previewColor }}
                        >
                          <PreviewIcon className="h-7 w-7" strokeWidth={2.2} />
                        </div>
                        <span className="text-[1.2rem] font-semibold text-foreground">
                          {getIconOption(appearance.profileIcon).label}
                        </span>
                      </div>
                    </div>
                  )}
                  <SettingRow label="メールアドレス" value={user.email} />
                  {isEditingProfile ? (
                    <>
                      <EditableSettingRow
                        label="学籍番号"
                        value={formValues.studentNumber}
                        onChange={(value) => handleFormChange("studentNumber", value)}
                      />
                      <EditableSettingRow
                        label="氏名"
                        value={formValues.personalName}
                        onChange={(value) => handleFormChange("personalName", value)}
                      />
                      <EditableSettingRow
                        label="ニックネーム"
                        value={formValues.nickName}
                        onChange={(value) => handleFormChange("nickName", value)}
                      />
                    </>
                  ) : (
                    <>
                      <SettingRow label="学籍番号" value={profile?.StudentNumber || "未登録"} />
                      <SettingRow label="氏名" value={profile?.PersonalName || "未登録"} />
                      <SettingRow label="ニックネーム" value={profile?.NickName || "未登録"} />
                    </>
                  )}
                  <div className="border-b border-border/70 py-4 last:border-b-0">
                    <p className="text-base font-semibold text-muted-foreground">テーマカラー</p>
                    {isEditingProfile ? (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {themeOptions.map((option) => {
                          const selected = appearance.themeId === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleAppearanceChange("themeId", option.id)}
                              className={`flex items-center justify-between rounded-xl border px-4 py-4 text-left ${
                                selected ? "border-primary bg-accent" : "border-border"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-6 w-6 rounded-full border border-black/10"
                                  style={{ backgroundColor: option.preview }}
                                />
                                <span className="text-[1.1rem] font-semibold">{option.label}</span>
                              </div>
                              {selected ? <Check className="h-5 w-5 text-primary" /> : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-3">
                        <span
                          className="h-6 w-6 rounded-full border border-black/10"
                          style={{ backgroundColor: previewTheme.preview }}
                        />
                        <span className="text-[1.2rem] font-semibold text-foreground">{previewTheme.label}</span>
                      </div>
                    )}
                  </div>
                  {profileMessage ? <p className="text-base font-medium text-muted-foreground">{profileMessage}</p> : null}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>リンク</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {quickLinks.map((item) => (
                <a key={item.label} href={item.to} className="block">
                  <Button fullWidth variant="secondary">
                    {item.label}
                  </Button>
                </a>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>通知</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[1.05rem] font-medium text-foreground/90 sm:text-[1.15rem]">
                予約の10分前に「利用開始」、終了時間に「返却」を促す通知を出します。
              </p>
              <p className="text-base font-semibold text-muted-foreground">
                状態: {notificationPermissionLabel(notificationPermission)}
              </p>
              {notificationPermission === "granted" ? (
                <p className="text-base font-medium text-muted-foreground">
                  ログイン時に自動で通知が有効になります。
                </p>
              ) : null}
              {canUseNotifications() && notificationPermission !== "granted" ? (
                <Button fullWidth variant="secondary" onClick={handleEnableNotifications}>
                  通知を許可する
                </Button>
              ) : null}
              {!canUseNotifications() ? (
                <p className="text-base font-medium text-muted-foreground">
                  このブラウザでは通知に対応していません。
                </p>
              ) : null}
            </CardContent>
          </Card>

          {user ? (
            <Card>
              <CardHeader>
                <CardTitle>アカウント操作</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Button fullWidth variant="secondary" onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? "ログアウト中..." : "ログアウト"}
                </Button>
                <Button fullWidth variant="destructive" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                  {isDeletingAccount ? "削除中..." : "アカウント削除"}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </Page>
      <Footer />
    </>
  );
}

function notificationPermissionLabel(permission) {
  if (permission === "granted") {
    return "有効";
  }

  if (permission === "denied") {
    return "拒否されています";
  }

  if (permission === "unsupported") {
    return "未対応";
  }

  return "未設定";
}

function SettingRow({ label, value }) {
  return (
    <div className="border-b border-border/70 py-4 last:border-b-0">
      <p className="text-base font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 text-[1.05rem] font-medium text-foreground/90 sm:text-[1.15rem]">{value}</p>
    </div>
  );
}

function EditableSettingRow({ label, value, onChange }) {
  return (
    <div className="border-b border-border/70 py-4 last:border-b-0">
      <p className="text-base font-semibold text-muted-foreground">{label}</p>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 h-14 rounded-xl text-[1.1rem]"
      />
    </div>
  );
}

export default Tool;
