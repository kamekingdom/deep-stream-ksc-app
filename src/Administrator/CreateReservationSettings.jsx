import React, { useState, useEffect } from "react";
import { deleteDoc, doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Footer, Header } from "../PageParts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
const timeSlots = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];
const SYSTEM_BLOCK_TEMPLATE_ID = "SYSTEM_BLOCKED";

function CreateReservationSettings() {
  const [selectedSlots, setSelectedSlots] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchBlockedSettings = async () => {
      const schedulesSnapshot = await getDocs(collection(db, "ReservationSchedules"));
      const nextSelectedSlots = {};

      schedulesSnapshot.forEach((docItem) => {
        const day = docItem.id;
        const reservations = docItem.data().Reservations || [];

        reservations
          .filter((reservation) => reservation.TemplateID === SYSTEM_BLOCK_TEMPLATE_ID)
          .forEach((reservation) => {
            (reservation.TimeSlots || []).forEach((timeSlot) => {
              nextSelectedSlots[`${day}_${timeSlot}`] = true;
            });
          });
      });

      setSelectedSlots(nextSelectedSlots);
    };

    fetchBlockedSettings();
  }, []);

  const handleCellClick = (day, timeSlot) => {
    const key = `${day}_${timeSlot}`;
    setSelectedSlots((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleDayToggle = (day) => {
    const dayKeys = timeSlots.map((timeSlot) => `${day}_${timeSlot}`);
    const isAllSelected = dayKeys.every((key) => selectedSlots[key]);

    setSelectedSlots((prevState) => {
      const nextState = { ...prevState };
      dayKeys.forEach((key) => {
        nextState[key] = !isAllSelected;
      });
      return nextState;
    });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const settingsData = {};

    Object.keys(selectedSlots).forEach((key) => {
      if (selectedSlots[key]) {
        const [day, timeSlot] = key.split("_");
        if (!settingsData[day]) {
          settingsData[day] = [];
        }
        settingsData[day].push(timeSlot);
      }
    });

    try {
      await Promise.all(
        weekDays.map(async (day) => {
          const blockedTimeSlots = settingsData[day] || [];
          const docRef = doc(db, "ReservationSchedules", day);

          if (blockedTimeSlots.length === 0) {
            await deleteDoc(docRef).catch(() => {});
            return;
          }

          await setDoc(docRef, {
            Reservations: [
              {
                TemplateID: SYSTEM_BLOCK_TEMPLATE_ID,
                TimeSlots: blockedTimeSlots,
              },
            ],
          });
        })
      );

      await setDoc(doc(db, "ReservationTemplate", SYSTEM_BLOCK_TEMPLATE_ID), {
        Category: "予約不可",
        Memo: "管理者によって予約できないように設定されています。",
        NickName: "管理者設定",
        PersonalName: "管理者設定",
        PostUserMail: "system@deep-stream.local",
        IsBlocked: true,
        BlockReason: "管理者によって予約できないように設定されています。",
      });

      alert("予約不可設定を保存しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Header />
      <Page>
        <PageHero eyebrow="Admin" title="予約不可設定" description="予約できない曜日・時間帯を管理者が指定します。" />
        <Card>
          <CardHeader>
            <CardTitle>予約不可スロット設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-base text-muted-foreground">
              曜日名を押すとその日をまとめて切り替え、セルを押すと個別に予約不可へ変更できます。
            </p>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time Slot</TableHead>
                  {weekDays.map((day) => (
                    <TableHead key={day}>
                      <button
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className="w-full text-center font-semibold"
                      >
                        {day}
                      </button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots.map((timeSlot) => (
                  <TableRow key={timeSlot}>
                    <TableCell className="font-semibold">{timeSlot}</TableCell>
                    {weekDays.map((day) => {
                      const key = `${day}_${timeSlot}`;
                      const selected = selectedSlots[key];
                      return (
                        <TableCell key={key}>
                          <button
                            type="button"
                            onClick={() => handleCellClick(day, timeSlot)}
                            className={`w-full rounded-2xl px-3 py-2 text-sm font-semibold ${
                              selected
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {selected ? "予約不可" : "予約可"}
                          </button>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button fullWidth onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? "保存中..." : "予約不可設定を保存"}
            </Button>
          </CardContent>
        </Card>
      </Page>
      <Footer />
    </>
  );
}

export default CreateReservationSettings;
