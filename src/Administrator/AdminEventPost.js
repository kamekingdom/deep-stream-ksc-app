import React, { useState } from "react";
import { Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Footer, Header } from "../PageParts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";
import { Textarea } from "../components/ui/textarea";

function AdminEventPost() {
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const time = `${hours < 10 ? "0" : ""}${hours}${minutes < 10 ? "0" : ""}${minutes}`;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("0");
  const [isAlreadyUploaded, setIsAlreadyUploaded] = useState(false);

  const handleUploadClick = async () => {
    const docName = `2023${month.toString().padStart(2, "0")}${day.toString().padStart(2, "0")}${time}`;
    await setDoc(doc(db, "NotificationPosts", docName), {
      Title: title,
      Content: content,
      Link: link,
      Category: parseInt(category, 10),
    });
    setIsAlreadyUploaded(true);
  };

  return (
    <>
      <Header />
      <Page className="max-w-3xl">
        <PageHero
          eyebrow="Admin"
          title="イベント投稿"
          description="提出書類やお知らせをカテゴリ付きで投稿します。"
        />
        <Card>
          <CardHeader>
            <CardTitle>投稿内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="0">メモ</option>
              <option value="1">注意</option>
              <option value="2">アンケート</option>
              <option value="3">確認</option>
            </select>
            <Textarea placeholder="タイトル" maxLength={20} value={title} onChange={(e) => setTitle(e.target.value)} className="min-h-[96px]" />
            <Textarea placeholder="内容" value={content} onChange={(e) => setContent(e.target.value)} />
            <Textarea placeholder="リンク" value={link} onChange={(e) => setLink(e.target.value)} className="min-h-[96px]" />

            {!isAlreadyUploaded ? (
              <Button fullWidth onClick={handleUploadClick} disabled={!title || !content || !category}>
                送信
              </Button>
            ) : (
              <Link to="/adminhome" className="block">
                <Button fullWidth>完了</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </Page>
      <Footer />
    </>
  );
}

export default AdminEventPost;
