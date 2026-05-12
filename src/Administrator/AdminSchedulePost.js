import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { Footer, Header } from "../PageParts";
import { db } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";
import { Textarea } from "../components/ui/textarea";

function AdminSchedulePost() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [dayofweek, setDayofWeek] = useState("");
  const [category, setCategory] = useState("1");
  const [content, setContent] = useState("");
  const dateInputRef = useRef(null);
  const [isAlreadyUploaded, setIsAlreadyUploaded] = useState(false);

  const handleUploadClick = async () => {
    const docName = `2023${month.toString().padStart(2, "0")}${day.toString().padStart(2, "0")}`;
    const schedulesRef = doc(db, "Schedules", docName);
    await setDoc(schedulesRef, {
      title,
      link,
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      dayofweek,
      content,
      category,
    });
    setIsAlreadyUploaded(true);
  };

  const handleDateChange = () => {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const dateString = dateInputRef.current.value;
    const dateObject = new Date(dateString);
    setMonth(dateObject.getMonth() + 1);
    setDay(dateObject.getDate());
    setDayofWeek(weekdays[dateObject.getDay()]);
  };

  return (
    <>
      <Header />
      <Page className="max-w-3xl">
        <PageHero eyebrow="Admin" title="スケジュール投稿" description="ライブやイベント予定をカレンダー用データとして登録します。" />
        <Card>
          <CardHeader>
            <CardTitle>スケジュール内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="date"
              ref={dateInputRef}
              onChange={handleDateChange}
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
            />
            <select
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="1">ライブ</option>
              <option value="2">イベント</option>
              <option value="3">メモ</option>
              <option value="0">その他</option>
            </select>
            <Textarea placeholder="タイトル" maxLength={20} value={title} onChange={(e) => setTitle(e.target.value)} className="min-h-[96px]" />
            <Textarea placeholder="内容" value={content} onChange={(e) => setContent(e.target.value)} />
            <Textarea placeholder="リンク" value={link} onChange={(e) => setLink(e.target.value)} className="min-h-[96px]" />

            {!isAlreadyUploaded ? (
              <Button fullWidth onClick={handleUploadClick} disabled={!title || !month || !content || !category}>
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

export default AdminSchedulePost;
