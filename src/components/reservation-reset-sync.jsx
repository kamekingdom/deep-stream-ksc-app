import { useEffect } from "react";
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
import { db } from "../firebase";

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

        batchSize += 1;
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

async function clearReservationSchedules() {
  try {
    const schedulesSnapshot = await getDocs(collection(db, "ReservationSchedules"));
    const deleteOps = schedulesSnapshot.docs.map(async (docItem) => deleteDoc(docItem.ref));
    await Promise.all(deleteOps);
  } catch (error) {
    console.error("ReservationSchedulesの初期化中にエラーが発生しました:", error);
  }
}

async function ensureWeeklyReservationReset() {
  const today = moment();
  const dayOfWeek = today.day();
  if (dayOfWeek !== 0 && dayOfWeek !== 1 && dayOfWeek !== 2) {
    return;
  }

  const docRef = doc(db, "Setting", "Reservation");
  const docSnap = await getDoc(docRef);
  const sunday = today.clone().startOf("week");
  const nextResetDate = sunday.format("YYYYMMDD");

  if (docSnap.exists() && docSnap.data().LastResetDate === nextResetDate) {
    return;
  }

  const batch = writeBatch(db);
  batch.set(doc(db, "Setting", "Reservation"), { LastResetDate: nextResetDate });

  const userDocs = await getDocs(query(collection(db, "users")));
  userDocs.forEach((docItem) => {
    batch.update(docItem.ref, { ReservationNum: 0 });
  });

  const deleteOps = [];
  const weekDayList = ["月", "火", "水", "木", "金", "土", "日"];
  const timeSlotList = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];

  weekDayList.forEach((weekday) => {
    timeSlotList.forEach((timeslot) => {
      deleteOps.push(deleteDoc(doc(db, weekday, timeslot)));
    });
  });

  await Promise.all(deleteOps);
  await batch.commit();
  await addReservations();
  await clearReservationSchedules();
  await deleteReservationSettings();
}

function ReservationResetSync() {
  useEffect(() => {
    ensureWeeklyReservationReset().catch((error) => {
      console.error("予約リセット処理に失敗しました:", error);
    });
  }, []);

  return null;
}

export default ReservationResetSync;
