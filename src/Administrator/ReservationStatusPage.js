import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Footer, Header } from "../PageParts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
const timeSlots = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];

function ReservationStatusPage() {
  const [reservationData, setReservationData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservationData = async () => {
      setLoading(true);
      const allReservations = {};

      for (const day of weekDays) {
        const dayCollection = collection(db, day);
        const daySnapshot = await getDocs(dayCollection);
        const reservationsForDay = {};
        daySnapshot.docs.forEach((docItem) => {
          reservationsForDay[docItem.id] = docItem.data();
        });
        allReservations[day] = reservationsForDay;
      }

      setReservationData(allReservations);
      setLoading(false);
    };

    fetchReservationData();
  }, []);

  return (
    <>
      <Header />
      <Page>
        <PageHero eyebrow="Admin" title="予約状況" description="曜日と時間帯ごとに、現在の予約情報を管理画面で一覧できます。" />
        {loading ? (
          <Spinner label="予約状況を読み込んでいます..." />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>予約ステータス</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time Slot</TableHead>
                    {weekDays.map((day) => (
                      <TableHead key={day}>{day}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((timeSlot) => (
                    <TableRow key={timeSlot}>
                      <TableCell className="font-semibold">{timeSlot}</TableCell>
                      {weekDays.map((day) => {
                        const reservation = reservationData[day]?.[timeSlot];
                        return (
                          <TableCell key={day}>
                            {reservation ? (
                              <div className="space-y-1 text-sm">
                                <p className="font-semibold">{reservation.NickName}</p>
                                <p className="text-muted-foreground">{reservation.Category}</p>
                                <p className="text-muted-foreground">{reservation.PersonalName}</p>
                              </div>
                            ) : (
                              "空き"
                            )}
                          </TableCell>
                        );
                      })}
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

export default ReservationStatusPage;
