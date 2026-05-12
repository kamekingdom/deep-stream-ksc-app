import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { Footer, Header } from "../PageParts";
import { ReservationContext } from "../App";
import { auth, db } from "../firebase";
import termsOfServicePdf from "../assets/2023部室利用規約.pdf";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const TIME_SLOT_LIST = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];
const TIME_LIST = ["8:00 ~ 8:50", "9:00 ~ 10:40", "10:40 ~ 11:10", "11:10 ~ 12:50", "12:50 ~ 13:30", "13:30 ~ 15:10", "15:20 ~ 17:00", "17:05 ~ 18:45", "18:50 ~ 19:50", "20:00 ~ 21:00"];
const WEEK_DAY_LIST = ["　　　　", "日", "月", "火", "水", "木", "金", "土"];
const DAY_OF_WEEK_LIST = ["日", "月", "火", "水", "木", "金", "土"];

function Reservation() {
  const [loading, setLoading] = useState(true);
  const reservationInfo = useContext(ReservationContext);

  const currentDate = new Date();
  const currentDayIndex = currentDate.getDay();
  const currentDay = DAY_OF_WEEK_LIST[currentDayIndex];
  const [reserve, setReserve] = useState(null);
  const dayOfWeekStrIndex = DAY_OF_WEEK_LIST.indexOf(currentDay);

  const isAvailableReservationDay = [];
  for (let i = 0; i < DAY_OF_WEEK_LIST.length; i += 1) {
    isAvailableReservationDay.push(i > dayOfWeekStrIndex - 1);
  }

  useEffect(() => {
    async function findFirestoreData() {
      try {
        const newData = await Promise.all(
          WEEK_DAY_LIST.map(async (weekday) =>
            Promise.all(
              TIME_SLOT_LIST.map(async (slot) => {
                const docRef = doc(db, weekday, slot);
                const docSnap = await getDoc(docRef);
                return docSnap.exists() ? docSnap.data().PostUserMail : false;
              })
            )
          )
        );
        setReserve(newData);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
    findFirestoreData();
  }, []);

  function setReservationMeta(weekday, timeslot, time) {
    reservationInfo.WeekDay = weekday;
    reservationInfo.TimeSlot = timeslot;
    reservationInfo.Time = time;
  }

  const renderCell = (weekday, weekdayIndex, timeSlot, slotIndex) => {
    const targetEmail = reserve[weekdayIndex + 1][slotIndex];
    const isFutureOrToday = isAvailableReservationDay[weekdayIndex];

    if (isFutureOrToday) {
      if (targetEmail === auth.currentUser.email) {
        return (
          <Link to="/reservationdetail" onClick={() => setReservationMeta(weekday, timeSlot, TIME_LIST[slotIndex])}>
            <Badge variant="secondary">自分</Badge>
          </Link>
        );
      }
      if (targetEmail) {
        return (
          <Link to="/reservationdetail" onClick={() => setReservationMeta(weekday, timeSlot, TIME_LIST[slotIndex])}>
            <Badge variant="destructive">予約済み</Badge>
          </Link>
        );
      }
      return (
        <Link to="/addreservation" onClick={() => setReservationMeta(weekday, timeSlot, TIME_LIST[slotIndex])}>
          <Badge>予約可</Badge>
        </Link>
      );
    }

    if (targetEmail === auth.currentUser.email) {
      return (
        <Link to="/alertreservation" onClick={() => setReservationMeta(weekday, timeSlot, TIME_LIST[slotIndex])}>
          <Badge variant="secondary">履歴</Badge>
        </Link>
      );
    }

    return (
      <Link to="/alertreservation" onClick={() => setReservationMeta(weekday, timeSlot, TIME_LIST[slotIndex])}>
        <Badge variant="outline">締切</Badge>
      </Link>
    );
  };

  return (
    <>
      <Header />
      <Page>
        <PageHero
          eyebrow="Reservation"
          title="部室予約"
          description="曜日と時間帯ごとの予約状況を一覧で確認し、そのまま詳細や新規予約へ進めます。"
          actions={
            <a href={termsOfServicePdf} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">部室の利用規約</Button>
            </a>
          }
        />

        {loading ? (
          <Spinner label="予約状況を読み込んでいます..." />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>予約テーブル</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>時間帯</TableHead>
                    {DAY_OF_WEEK_LIST.map((weekday) => (
                      <TableHead key={weekday}>{weekday}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TIME_SLOT_LIST.map((timeSlot, slotIndex) => (
                    <TableRow key={timeSlot}>
                      <TableCell className="font-semibold">{timeSlot}</TableCell>
                      {DAY_OF_WEEK_LIST.map((weekday, weekdayIndex) => (
                        <TableCell key={`${weekday}-${timeSlot}`}>
                          {renderCell(weekday, weekdayIndex, timeSlot, slotIndex)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Page>
      <Footer />
    </>
  );
}

export default Reservation;
