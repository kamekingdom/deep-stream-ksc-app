import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  writeBatch,
} from "firebase/firestore";
import moment from "moment";
import packageInfo from "../../package.json";
import { Footer, Header } from "../PageParts";
import { db } from "../firebase";
import useIsMobile from "../function/isMobile";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Page, PageHero } from "../components/page";

function HomePage() {
  const isMobile = useIsMobile();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShow(false);
    }, 1800);

    return () => clearTimeout(timeoutId);
  }, []);

  async function addReservations() {
    let batch = writeBatch(db);
    let batchSize = 0;
    const maxBatchSize = 500;
    const schedulesSnapshot = await getDocs(collection(db, "ReservationSchedules"));

    for (const scheduleDoc of schedulesSnapshot.docs) {
      const day = scheduleDoc.id;
      const { Reservations } = scheduleDoc.data();

      for (const reservation of Reservations) {
        const { TemplateID, TimeSlots } = reservation;
        const templateDoc = await getDoc(doc(db, "ReservationTemplate", TemplateID));
        if (!templateDoc.exists()) {
          continue;
        }

        const templateData = templateDoc.data();

        for (const timeSlot of TimeSlots) {
          const reservationDoc = doc(db, day, timeSlot);
          batch.set(reservationDoc, {
            ...templateData,
            TimeSlot: timeSlot,
            WeekDay: day,
            ReservationNum: 0,
          });

          batchSize++;
          if (batchSize >= maxBatchSize) {
            await batch.commit();
            batch = writeBatch(db);
            batchSize = 0;
          }
        }
      }
    }

    if (batchSize > 0) {
      await batch.commit();
    }
  }

  async function deleteReservationSettings() {
    try {
      const settingsSnapshot = await getDocs(collection(db, "ReservationSettings"));
      const deleteOps = settingsSnapshot.docs.map(async (docItem) => deleteDoc(docItem.ref));
      await Promise.all(deleteOps);
    } catch (error) {
      console.error("ReservationSettingsの削除中にエラーが発生しました:", error);
    }
  }

  useEffect(() => {
    async function fetchFirestoreData() {
      const today = moment();
      const dayOfWeek = today.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 1 && dayOfWeek !== 2) {
        return;
      }

      const docRef = doc(db, "Setting", "Reservation");
      const docSnap = await getDoc(docRef, { source: "cache" });
      const sunday = today.clone().startOf("week");
      if (docSnap.exists() && docSnap.data().LastResetDate === sunday.format("YYYYMMDD")) {
        return;
      }

      const batch = writeBatch(db);
      const settingRef = doc(db, "Setting", "Reservation");
      batch.set(settingRef, { LastResetDate: sunday.format("YYYYMMDD") });
      const usersRef = collection(db, "users");
      const reservationNumQuery = query(usersRef);
      const userDocs = await getDocs(reservationNumQuery);
      userDocs.forEach((docItem) => {
        batch.update(docItem.ref, { ReservationNum: 0 });
      });

      const deleteOps = [];
      const weekDayList = ["月", "火", "水", "木", "金", "土", "日"];
      const timeSlotList = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];

      weekDayList.forEach((weekday) => {
        timeSlotList.forEach((timeslot) => {
          const docToDelete = doc(db, weekday, timeslot);
          deleteOps.push(deleteDoc(docToDelete));
        });
      });

      await Promise.all(deleteOps);
      await batch.commit();
      await addReservations();
      await deleteReservationSettings();
    }

    fetchFirestoreData();
  }, []);

  if (show) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-[40px] border border-border/60 bg-card/90 p-10 text-center shadow-soft">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-primary/10 p-4">
            <img src="/DeepStreamICON.jpg" alt="Deep Stream" className="rounded-[20px]" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-primary">KSC App</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Deep Stream</h1>
          <p className="mt-3 text-sm text-muted-foreground">Version {packageInfo.version}</p>
        </div>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <Page className="flex min-h-screen items-center justify-center">
        <Card className="max-w-xl text-center">
          <CardContent className="space-y-5 p-8">
            <Badge className="mx-auto w-fit">Mobile First</Badge>
            <h2 className="text-3xl font-black">スマートフォンからアクセスしてください</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              このアプリはモバイルでの利用を前提に再設計されています。スマートフォンから開くと、予約や確認フローが最も使いやすい表示になります。
            </p>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <>
      <Header />
      <Page>
        <PageHero
          eyebrow="Deep Stream"
          title="軽音サークルの運営を、ひとつのアプリに。"
          description="部室利用、予約、提出書類、各種ツールをモバイル中心の新しい UI でまとめています。"
          actions={
            <>
              <a href="/reservation">
                <Button>部室予約</Button>
              </a>
              <a href="/notification">
                <Button variant="secondary">提出書類</Button>
              </a>
            </>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="部室利用"
            description="現在の鍵の状態や利用状況を、すばやく確認できます。"
          />
          <FeatureCard
            title="部室予約"
            description="曜日・時間帯ごとに予約状況を見ながら、そのまま申請できます。"
          />
          <FeatureCard
            title="提出書類"
            description="最新のお知らせや提出導線を、カテゴリ付きで整理して確認できます。"
          />
        </div>
      </Page>
      <Footer />
    </>
  );
}

function FeatureCard({ title, description }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default HomePage;
