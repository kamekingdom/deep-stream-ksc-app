import React, { useEffect, useState } from "react";
import { Footer, Header } from "../PageParts";
import "../css/kame.css";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  writeBatch,
} from "firebase/firestore";
import { db, } from "../firebase";
import moment from "moment";
import useIsMobile from "../function/isMobile";

import packageInfo from '../../package.json';

function HomePage() {
  const isMobile = useIsMobile();

  /* スプラッシュスクリーンの表示設定 */
  const [show, setShow] = useState(true); // スプラッシュスクリーンをshowするか否か

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Firestoreから予約設定データを取得し、自動予約を行う
  async function addReservations() {
    let batch = writeBatch(db);
    let batchSize = 0;
    const maxBatchSize = 500; // Firestoreのバッチサイズの制限

    // 1. Firestoreから予約スケジュールを取得
    const schedulesSnapshot = await getDocs(collection(db, 'ReservationSchedules'));

    for (const scheduleDoc of schedulesSnapshot.docs) {
      const day = scheduleDoc.id;
      const { Reservations } = scheduleDoc.data();  // 各日の `Reservations` 配列を取得

      // 2. `Reservations` 配列の各テンプレートIDごとに予約を実行
      for (const reservation of Reservations) {
        const { TemplateID, TimeSlots } = reservation;

        // 3. Firestoreからテンプレートを取得
        const templateDoc = await getDoc(doc(db, 'ReservationTemplate', TemplateID));
        if (!templateDoc.exists()) {
          console.error(`テンプレートID ${TemplateID} に該当するテンプレートが見つかりません。`);
          continue;
        }

        const templateData = templateDoc.data();

        // 4. 各タイムスロットに対して予約を作成
        for (const timeSlot of TimeSlots) {
          const reservationDoc = doc(db, day, timeSlot);  // 各タイムスロットのドキュメント
          batch.set(reservationDoc, {
            ...templateData,  // テンプレートの内容をコピー
            TimeSlot: timeSlot,
            WeekDay: day,
            ReservationNum: 0  // 初期状態の予約数
          });

          batchSize++;

          // バッチのサイズが上限に達したらコミットし、新しいバッチを作成
          if (batchSize >= maxBatchSize) {
            await batch.commit();
            batch = writeBatch(db);
            batchSize = 0;
          }
        }
      }
    }

    // 最後のバッチをコミット
    if (batchSize > 0) {
      await batch.commit();
    }

    console.log('予約処理が完了しました。');
  }

  // ReservationSettings コレクションを削除する処理
  async function deleteReservationSettings() {
    try {
      // FirestoreからReservationSettingsコレクションのすべてのドキュメントを取得
      const settingsSnapshot = await getDocs(collection(db, 'ReservationSettings'));

      // ドキュメントを一つずつ削除
      const deleteOps = settingsSnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // 全ての削除操作が完了するまで待機
      await Promise.all(deleteOps);

      console.log('ReservationSettingsが削除されました。');
    } catch (error) {
      console.error('ReservationSettingsの削除中にエラーが発生しました:', error);
    }
  }


  // ここでリセット
  useEffect(() => {
    async function fetchFirestoreData() {
      const today = moment();
      const dayOfWeek = today.day(); // 0 (日曜日) から 6 (土曜日) の範囲で取得できます

      // 日曜日、月曜日、火曜日以外は処理をスキップします
      if (dayOfWeek !== 0 && dayOfWeek !== 1 && dayOfWeek !== 2) {
        return;
      }

      const docRef = doc(db, "Setting", "Reservation");
      const docSnap = await getDoc(docRef, { source: "cache" });
      const sunday = today.clone().startOf("week");
      if (
        docSnap.exists() &&
        docSnap.data().LastResetDate === sunday.format("YYYYMMDD")
      ) {
        return;
      }
      console.log("Reset Reservation Data");
      const batch = writeBatch(db);
      const settingRef = doc(db, "Setting", "Reservation");
      batch.set(settingRef, { LastResetDate: sunday.format("YYYYMMDD") });
      const usersRef = collection(db, "users");
      const reservationNumQuery = query(usersRef);
      const userDocs = await getDocs(reservationNumQuery);
      userDocs.forEach((doc) => {
        batch.update(doc.ref, { ReservationNum: 0 });
      });
      const deleteOps = [];
      const WeekDayList = ["月", "火", "水", "木", "金", "土", "日"];
      const TimeSlotList = [
        "朝練",
        "１限",
        "チャペル",
        "２限",
        "昼練",
        "３限",
        "４限",
        "５限",
        "夜練Ⅰ",
        "夜練Ⅱ",
      ];
      WeekDayList.forEach((weekday) => {
        TimeSlotList.forEach((timeslot) => {
          const docToDelete = doc(db, weekday, timeslot);
          deleteOps.push(deleteDoc(docToDelete));
        });
      });
      await Promise.all(deleteOps);
      await batch.commit();
      console.log("fin");

      // 初期化後に複数の曜日に予約を追加する
      await addReservations();

      // ReservationSettingsを削除
      await deleteReservationSettings();
    }


    fetchFirestoreData();
  }, []);

  return show ? (
    <div>
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8410469642859077"
        crossorigin="anonymous"
      ></script>
      <div id="container">
        <span></span>
        <span></span>
        <span></span>
        <p style={{ fontSize: "2.0em" }}>Deep Stream</p>
        <p style={{ fontSize: "1.5em" }}>ver {packageInfo.version}</p>
      </div>
    </div>
  ) : isMobile ? (
    <>
      <Header />
      <center>
        <div
          style={{
            minHeight: "calc(70vh - 100px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 20px",
          }}
        >
          <img
            src="/DeepStreamICON.jpg"
            alt="Deep Stream"
            style={{
              width: "min(260px, 72vw)",
              borderRadius: "24px",
              boxShadow: "0 16px 32px rgba(0, 0, 0, 0.12)",
              marginBottom: "24px",
            }}
          />
          <p
            className="kame_font_003"
            style={{ marginBottom: "12px" }}
          >
            Deep Stream
          </p>
          <p style={{ fontSize: "1rem", lineHeight: 1.7, margin: 0 }}>
            イベント確認や部室予約は、下のメニューから利用できます。
          </p>
        </div>
      </center>
      <Footer />
    </>
  ) : (
    <center>
      <p className="kame_font_002 my-5">Please access from a smartphone.</p>
      <svg
        xmlns="http://www.w3.org/2  0 00/svg"
        width="132"
        height="132"
        fill="currentColor"
        className="bi bi-phone"
        viewBox="0 0 16 16"
      >
        <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z" />
        <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
      </svg>
    </center>
  );
}


export default HomePage;
