import React, { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Footer, Header } from "../PageParts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
const timeSlots = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];
const SYSTEM_BLOCK_TEMPLATE_ID = "SYSTEM_BLOCKED";
const SYSTEM_BLOCK_MESSAGE = "管理者によって予約できないように設定されています。";

function formatDate(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function getWeekRange(startOffsetWeeks) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(today.getDate() - today.getDay() + startOffsetWeeks * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return `${formatDate(weekStart)}から${formatDate(weekEnd)}の週`;
}

function ScheduleTable({ selectedSlots, onCellClick, onDayToggle }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time Slot</TableHead>
          {weekDays.map((day) => (
            <TableHead key={day}>
              <button
                type="button"
                onClick={() => onDayToggle(day)}
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
                    onClick={() => onCellClick(day, timeSlot)}
                    className={`w-full rounded-2xl px-3 py-2 text-sm font-semibold ${
                      selected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
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
  );
}

function CreateReservationSettings() {
  const [currentWeekSlots, setCurrentWeekSlots] = useState({});
  const [nextWeekSlots, setNextWeekSlots] = useState({});
  const [isSavingCurrentWeek, setIsSavingCurrentWeek] = useState(false);
  const [isSavingNextWeek, setIsSavingNextWeek] = useState(false);
  const [activeTab, setActiveTab] = useState("current");

  const currentWeekRangeLabel = getWeekRange(0);
  const nextWeekRangeLabel = getWeekRange(1);

  useEffect(() => {
    const fetchBlockedSettings = async () => {
      const [schedulesSnapshot, currentWeekSnapshot] = await Promise.all([
        getDocs(collection(db, "ReservationSchedules")),
        Promise.all(
          weekDays.map(async (day) => {
            const docs = await Promise.all(
              timeSlots.map(async (timeSlot) => {
                const snapshot = await getDoc(doc(db, day, timeSlot));
                return { day, timeSlot, snapshot };
              })
            );
            return docs;
          })
        ),
      ]);

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

      const currentSelectedSlots = {};
      currentWeekSnapshot.flat().forEach(({ day, timeSlot, snapshot }) => {
        if (snapshot.exists() && snapshot.data().IsBlocked) {
          currentSelectedSlots[`${day}_${timeSlot}`] = true;
        }
      });

      setCurrentWeekSlots(currentSelectedSlots);
      setNextWeekSlots(nextSelectedSlots);
    };

    fetchBlockedSettings();
  }, []);

  const handleCellClick = (setState) => (day, timeSlot) => {
    const key = `${day}_${timeSlot}`;
    setState((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleDayToggle = (selectedSlots, setState) => (day) => {
    const dayKeys = timeSlots.map((timeSlot) => `${day}_${timeSlot}`);
    const isAllSelected = dayKeys.every((key) => selectedSlots[key]);

    setState((prevState) => {
      const nextState = { ...prevState };
      dayKeys.forEach((key) => {
        nextState[key] = !isAllSelected;
      });
      return nextState;
    });
  };

  const buildSettingsData = (selectedSlots) => {
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

    return settingsData;
  };

  const ensureBlockTemplate = async () => {
    const blockTemplateData = {
      Category: "予約不可",
      Memo: SYSTEM_BLOCK_MESSAGE,
      NickName: "管理者設定",
      PersonalName: "管理者設定",
      PostUserMail: "system@deep-stream.local",
      IsBlocked: true,
      BlockReason: SYSTEM_BLOCK_MESSAGE,
      TemplateID: SYSTEM_BLOCK_TEMPLATE_ID,
    };

    await setDoc(doc(db, "ReservationTemplate", SYSTEM_BLOCK_TEMPLATE_ID), blockTemplateData);
    return blockTemplateData;
  };

  const handleSaveCurrentWeek = async () => {
    setIsSavingCurrentWeek(true);

    try {
      const blockTemplateData = await ensureBlockTemplate();
      let skippedReservedSlots = 0;

      await Promise.all(
        weekDays.flatMap((day) =>
          timeSlots.map(async (timeSlot) => {
            const key = `${day}_${timeSlot}`;
            const shouldBeBlocked = Boolean(currentWeekSlots[key]);
            const docRef = doc(db, day, timeSlot);
            const docSnap = await getDoc(docRef);

            if (shouldBeBlocked) {
              if (!docSnap.exists() || docSnap.data().IsBlocked) {
                await setDoc(docRef, {
                  ...blockTemplateData,
                  TimeSlot: timeSlot,
                  WeekDay: day,
                  ReservationNum: 0,
                });
                return;
              }

              skippedReservedSlots += 1;
              return;
            }

            if (docSnap.exists() && docSnap.data().IsBlocked) {
              await deleteDoc(docRef);
            }
          })
        )
      );

      if (skippedReservedSlots > 0) {
        alert(`今週の予約不可設定を保存しました。${skippedReservedSlots}件は予約済みのため変更していません。`);
      } else {
        alert(`今週（${currentWeekRangeLabel}）の予約不可設定を保存しました。`);
      }
    } finally {
      setIsSavingCurrentWeek(false);
    }
  };

  const handleSaveNextWeek = async () => {
    setIsSavingNextWeek(true);
    const settingsData = buildSettingsData(nextWeekSlots);

    try {
      await ensureBlockTemplate();

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

      alert(`翌週（${nextWeekRangeLabel}）の予約不可設定を保存しました。`);
    } finally {
      setIsSavingNextWeek(false);
    }
  };

  return (
    <>
      <Header />
      <Page>
        <PageHero title="予約不可設定" />
        <Card>
          <CardHeader className="space-y-4">
            <CardTitle>予約不可スロット設定</CardTitle>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("current")}
                className={`rounded-2xl border px-4 py-3 text-base font-semibold transition-colors ${
                  activeTab === "current"
                    ? "border-primary bg-accent text-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                今週
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("next")}
                className={`rounded-2xl border px-4 py-3 text-base font-semibold transition-colors ${
                  activeTab === "next"
                    ? "border-primary bg-accent text-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                翌週
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {activeTab === "current" ? (
              <>
                <p className="text-[1.05rem] font-semibold text-foreground">
                  {currentWeekRangeLabel} の予約不可設定
                </p>
                <p className="text-base text-muted-foreground">
                  今週の予約表を直接修正します。予約済みのスロットは上書きせず、そのまま残します。
                </p>

                <ScheduleTable
                  selectedSlots={currentWeekSlots}
                  onCellClick={handleCellClick(setCurrentWeekSlots)}
                  onDayToggle={handleDayToggle(currentWeekSlots, setCurrentWeekSlots)}
                />

                <Button fullWidth onClick={handleSaveCurrentWeek} disabled={isSavingCurrentWeek}>
                  {isSavingCurrentWeek ? "保存中..." : "今週の予約不可設定を保存"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-[1.05rem] font-semibold text-foreground">
                  {nextWeekRangeLabel} の予約不可設定
                </p>
                <p className="text-base text-muted-foreground">
                  曜日名を押すとその日をまとめて切り替え、セルを押すと個別に予約不可へ変更できます。ここで保存した内容は、次回の予約リセット後の週に反映されます。
                </p>

                <ScheduleTable
                  selectedSlots={nextWeekSlots}
                  onCellClick={handleCellClick(setNextWeekSlots)}
                  onDayToggle={handleDayToggle(nextWeekSlots, setNextWeekSlots)}
                />

                <Button fullWidth onClick={handleSaveNextWeek} disabled={isSavingNextWeek}>
                  {isSavingNextWeek ? "保存中..." : "翌週の予約不可設定を保存"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Page>
      <Footer />
    </>
  );
}

export default CreateReservationSettings;
