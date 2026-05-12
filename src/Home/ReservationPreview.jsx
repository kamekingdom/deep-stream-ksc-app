import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Footer, Header } from "../PageParts";
import { db } from "../firebase";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const TIME_SLOT_LIST = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];
const WEEK_DAY_LIST = ["日", "月", "火", "水", "木", "金", "土"];

function ReservationPreview() {
  const [reservationsMatrix, setReservationsMatrix] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservationFiles() {
      try {
        const nextMatrix = {};
        await Promise.all(
          WEEK_DAY_LIST.map(async (day) => {
            nextMatrix[day] = {};
            await Promise.all(
              TIME_SLOT_LIST.map(async (slot) => {
                const docSnap = await getDoc(doc(db, day, slot));
                nextMatrix[day][slot] = docSnap.exists() ? docSnap.data() : null;
              })
            );
          })
        );
        setReservationsMatrix(nextMatrix);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reservation data:", error);
        setLoading(false);
      }
    }

    fetchReservationFiles();
  }, []);

  return (
    <>
      <Header />
      <Page>
        <PageHero
          eyebrow="Preview"
          title="予約プレビュー"
          description="曜日と時間帯ごとの予約名義を、運営向けに一覧表示します。"
        />
        {loading ? (
          <Spinner label="プレビューを読み込んでいます..." />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>予約一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>時間帯</TableHead>
                    {WEEK_DAY_LIST.map((day) => (
                      <TableHead key={day}>{day}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TIME_SLOT_LIST.map((slot) => (
                    <TableRow key={slot}>
                      <TableCell className="font-semibold">{slot}</TableCell>
                      {WEEK_DAY_LIST.map((day) => (
                        <TableCell key={`${day}-${slot}`}>
                          {reservationsMatrix[day]?.[slot]?.PersonalName || "〇"}
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

export default ReservationPreview;
