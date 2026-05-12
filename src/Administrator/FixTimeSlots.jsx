import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Footer, Header } from "../PageParts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";
import { Spinner } from "../components/ui/spinner";

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
const incorrectTimeSlots = ["1限", "2限", "3限", "4限", "5限"];
const correctTimeSlots = ["１限", "２限", "３限", "４限", "５限"];

function FixTimeSlotsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fixTimeSlots = async () => {
      setLoading(true);
      try {
        for (const day of weekDays) {
          const dayCollection = collection(db, day);
          const daySnapshot = await getDocs(dayCollection);

          for (const docSnapshot of daySnapshot.docs) {
            const timeSlot = docSnapshot.id;
            const index = incorrectTimeSlots.indexOf(timeSlot);
            if (index !== -1) {
              const correctTimeSlot = correctTimeSlots[index];
              const correctDocRef = doc(db, day, correctTimeSlot);
              await setDoc(correctDocRef, docSnapshot.data());
              const incorrectDocRef = doc(db, day, timeSlot);
              await deleteDoc(incorrectDocRef);
            }
          }
        }

        setMessage("全てのタイムスロットの修正が完了しました。");
      } catch (error) {
        console.error("タイムスロットの修正中にエラーが発生しました: ", error);
        setMessage("エラーが発生しました。詳細をコンソールで確認してください。");
      }
      setLoading(false);
    };

    fixTimeSlots();
  }, []);

  return (
    <>
      <Header />
      <Page className="max-w-2xl">
        <PageHero eyebrow="Admin" title="タイムスロット修正" description="全角・半角のずれた時限表記を一括修正します。" />
        <Card>
          <CardHeader>
            <CardTitle>修正ステータス</CardTitle>
          </CardHeader>
          <CardContent>{loading ? <Spinner label="修正中です..." /> : <p>{message}</p>}</CardContent>
        </Card>
      </Page>
      <Footer />
    </>
  );
}

export default FixTimeSlotsPage;
