import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Footer, Header } from "../PageParts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Page, PageHero } from "../components/page";

function CreateReservationTemplate() {
  const [template, setTemplate] = useState({
    Category: "",
    Memo: "",
    NickName: "",
    PersonalName: "",
    PostUserMail: "",
  });

  const handleTemplateChange = (field, value) => {
    setTemplate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveTemplate = async () => {
    try {
      const docRef = await addDoc(collection(db, "ReservationTemplate"), template);
      alert(`テンプレートが保存されました。ID: ${docRef.id}`);
    } catch (error) {
      console.error("テンプレート保存時にエラーが発生しました: ", error);
    }
  };

  return (
    <>
      <Header />
      <Page className="max-w-3xl">
        <PageHero eyebrow="Admin" title="予約テンプレート作成" description="自動予約や緊急予約で使う固定情報をテンプレート化します。" />
        <Card>
          <CardHeader>
            <CardTitle>テンプレート情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={template.Category} onChange={(e) => handleTemplateChange("Category", e.target.value)} placeholder="Category" />
            <Input value={template.Memo} onChange={(e) => handleTemplateChange("Memo", e.target.value)} placeholder="Memo" />
            <Input value={template.NickName} onChange={(e) => handleTemplateChange("NickName", e.target.value)} placeholder="NickName" />
            <Input value={template.PersonalName} onChange={(e) => handleTemplateChange("PersonalName", e.target.value)} placeholder="Personal Name" />
            <Input type="email" value={template.PostUserMail} onChange={(e) => handleTemplateChange("PostUserMail", e.target.value)} placeholder="Email" />
            <Button fullWidth onClick={handleSaveTemplate}>
              Save Template
            </Button>
          </CardContent>
        </Card>
      </Page>
      <Footer />
    </>
  );
}

export default CreateReservationTemplate;
