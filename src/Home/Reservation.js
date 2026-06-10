import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { Ban, Circle, Clock3, Star, X } from "lucide-react";
import { Footer, Header } from "../PageParts";
import { ReservationContext } from "../App";
import { db } from "../firebase";
import termsOfServicePdf from "../assets/2023部室利用規約.pdf";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { getCurrentUserEmail, useCurrentUser } from "../lib/session-auth";

const TIME_SLOT_LIST = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];
const TIME_LIST = ["8:00 ~ 9:00", "9:00 ~ 10:30", "10:30 ~ 11:00", "11:00 ~ 12:30", "12:30 ~ 13:30", "13:30 ~ 15:00", "15:10 ~ 16:40", "16:50 ~ 18:20", "18:30 ~ 19:45", "19:45 ~ 21:00"];
const WEEK_DAY_LIST = ["　　　　", "日", "月", "火", "水", "木", "金", "土"];
const DAY_OF_WEEK_LIST = ["日", "月", "火", "水", "木", "金", "土"];

function StatusBadge({ variant = "default", icon, label, className = "" }) {
  return (
    <Badge
      variant={variant}
      className={`min-h-12 px-1 py-2 ${className}`}
      aria-label={label}
      title={label}
    >
      {icon}
    </Badge>
  );
}

function Reservation() {
  const [user, userLoading] = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const reservationInfo = useContext(ReservationContext);
  const pullStartYRef = useRef(null);
  const canPullRef = useRef(false);

  const currentDate = new Date();
  const currentDayIndex = currentDate.getDay();
  const currentDay = DAY_OF_WEEK_LIST[currentDayIndex];
  const [reserve, setReserve] = useState(null);
  const dayOfWeekStrIndex = DAY_OF_WEEK_LIST.indexOf(currentDay);

  const isAvailableReservationDay = [];
  for (let i = 0; i < DAY_OF_WEEK_LIST.length; i += 1) {
    isAvailableReservationDay.push(i > dayOfWeekStrIndex - 1);
  }

  const findFirestoreData = useCallback(async (showLoadingSpinner = false) => {
    if (!user) {
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (showLoadingSpinner) {
      setLoading(true);
    }

    try {
      const newData = await Promise.all(
        WEEK_DAY_LIST.map(async (weekday) =>
          Promise.all(
            TIME_SLOT_LIST.map(async (slot) => {
              const docRef = doc(db, weekday, slot);
              const docSnap = await getDoc(docRef);
              return docSnap.exists() ? docSnap.data() : null;
            })
          )
        )
      );
      setReserve(newData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [user]);

  useEffect(() => {
    findFirestoreData(true);
  }, [findFirestoreData]);

  const handleTouchStart = (event) => {
    if (loading || isRefreshing || window.scrollY > 4) {
      canPullRef.current = false;
      pullStartYRef.current = null;
      return;
    }

    pullStartYRef.current = event.touches[0].clientY;
    canPullRef.current = true;
  };

  const handleTouchMove = (event) => {
    if (!canPullRef.current || pullStartYRef.current === null) {
      return;
    }

    const distance = event.touches[0].clientY - pullStartYRef.current;
    if (distance <= 0) {
      setPullDistance(0);
      return;
    }

    setPullDistance(Math.min(distance, 96));
  };

  const handleTouchEnd = async () => {
    const shouldRefresh = pullDistance >= 72 && !isRefreshing;
    pullStartYRef.current = null;
    canPullRef.current = false;

    if (!shouldRefresh) {
      setPullDistance(0);
      return;
    }

    setIsRefreshing(true);
    await findFirestoreData(false);
  };

  if (!userLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  function setReservationMeta(weekday, timeslot, time, details = {}) {
    reservationInfo.WeekDay = weekday;
    reservationInfo.TimeSlot = timeslot;
    reservationInfo.Time = time;
    reservationInfo.Category = details.category || "";
    reservationInfo.Memo = details.memo || "";
  }

  const renderCell = (weekday, weekdayIndex, timeSlot, slotIndex) => {
    const reservation = reserve[weekdayIndex + 1][slotIndex];
    const targetEmail = reservation?.PostUserMail;
    const isBlocked = Boolean(reservation?.IsBlocked);
    const isFutureOrToday = isAvailableReservationDay[weekdayIndex];
    const currentUserEmail = getCurrentUserEmail();

    if (isBlocked) {
      return (
        <Link
          className="block w-full"
          to="/alertreservation"
          onClick={() =>
            setReservationMeta(weekday, timeSlot, TIME_LIST[slotIndex], {
              category: "予約不可",
              memo: reservation?.BlockReason || reservation?.Memo || "管理者によって予約できないように設定されています。",
            })
          }
        >
          <StatusBadge
            variant="outline"
            label="予約不可"
            icon={<Ban className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.2} />}
          />
        </Link>
      );
    }

    if (isFutureOrToday) {
      if (targetEmail && targetEmail === currentUserEmail) {
        return (
          <Link className="block w-full" to="/reservationdetail" onClick={() => setReservationMeta(weekday, timeSlot, TIME_LIST[slotIndex])}>
            <StatusBadge
              variant="secondary"
              label="自分の予約"
              icon={<Star className="h-7 w-7 fill-current sm:h-8 sm:w-8" strokeWidth={2.2} />}
            />
          </Link>
        );
      }
      if (targetEmail) {
        return (
          <Link className="block w-full" to="/reservationdetail" onClick={() => setReservationMeta(weekday, timeSlot, TIME_LIST[slotIndex])}>
            <StatusBadge
              variant="destructive"
              label="予約済み"
              icon={<X className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.4} />}
            />
          </Link>
        );
      }
      return (
        <Link className="block w-full" to="/addreservation" onClick={() => setReservationMeta(weekday, timeSlot, TIME_LIST[slotIndex])}>
          <StatusBadge
            label="予約可能"
            icon={<Circle className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.2} />}
          />
        </Link>
      );
    }

    if (targetEmail && targetEmail === currentUserEmail) {
      return (
        <Link className="block w-full" to="/alertreservation" onClick={() => setReservationMeta(weekday, timeSlot, TIME_LIST[slotIndex])}>
          <StatusBadge
            variant="secondary"
            label="自分の履歴"
            icon={<Star className="h-7 w-7 fill-current sm:h-8 sm:w-8" strokeWidth={2.2} />}
            className="opacity-70"
          />
        </Link>
      );
    }

    return (
      <Link className="block w-full" to="/alertreservation" onClick={() => setReservationMeta(weekday, timeSlot, TIME_LIST[slotIndex])}>
        <StatusBadge
          variant="outline"
          label="締切"
          icon={<Clock3 className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.2} />}
        />
      </Link>
    );
  };

  return (
    <>
      <Header />
      <Page className="max-w-4xl">
        {loading ? (
          <Spinner label="予約状況を読み込んでいます..." />
        ) : (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div
              className="flex items-end justify-center overflow-hidden transition-[height] duration-150 ease-out"
              style={{ height: `${pullDistance}px` }}
            >
              <div className="pb-3 text-center text-sm font-semibold text-muted-foreground">
                {isRefreshing ? "更新しています..." : pullDistance >= 72 ? "指を離して更新" : "下に引っ張って更新"}
              </div>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 p-5 sm:p-6">
                <div className="space-y-3">
                  <CardTitle className="leading-none">部室予約</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground sm:text-base">
                    <span className="inline-flex items-center gap-1.5">
                      <Circle className="h-4 w-4 text-primary" strokeWidth={2.2} />
                      予約可能
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <X className="h-4 w-4 text-destructive" strokeWidth={2.4} />
                      予約済み
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4" strokeWidth={2.2} />
                      締切
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Ban className="h-4 w-4" strokeWidth={2.2} />
                      予約不可
                    </span>
                  </div>
                </div>
                <a href={termsOfServicePdf} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <Button variant="secondary">
                    利用規約
                  </Button>
                </a>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <colgroup>
                    <col style={{ width: "20%" }} />
                    {DAY_OF_WEEK_LIST.map((weekday) => (
                      <col key={weekday} style={{ width: `${80 / DAY_OF_WEEK_LIST.length}%` }} />
                    ))}
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[20%]">時間帯</TableHead>
                      {DAY_OF_WEEK_LIST.map((weekday) => (
                        <TableHead key={weekday} className="text-center">{weekday}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TIME_SLOT_LIST.map((timeSlot, slotIndex) => (
                      <TableRow key={timeSlot}>
                        <TableCell className="text-left">
                          <div className="font-bold leading-tight text-[1.2rem] sm:text-[1.35rem]">
                            {timeSlot}
                          </div>
                          <div className="mt-1 text-[0.78rem] font-medium leading-tight text-muted-foreground sm:text-[0.9rem]">
                            {TIME_LIST[slotIndex]}
                          </div>
                        </TableCell>
                        {DAY_OF_WEEK_LIST.map((weekday, weekdayIndex) => (
                          <TableCell key={`${weekday}-${timeSlot}`} className="text-center">
                            {renderCell(weekday, weekdayIndex, timeSlot, slotIndex)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </Page>
      <Footer />
    </>
  );
}

export default Reservation;
