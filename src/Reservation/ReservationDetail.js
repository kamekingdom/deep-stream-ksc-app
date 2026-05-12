import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { Footer, Header } from "../PageParts";
import { ReservationContext } from "../App";
import { db } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableRow } from "../components/ui/table";
import { getCurrentUserEmail } from "../lib/session-auth";

function ReservationDetail() {
  const DAYOFWEEKSTR = ["日", "月", "火", "水", "木", "金", "土"];
  const date = new Date();
  const dayOfWeek = date.getDay();
  const currentDay = DAYOFWEEKSTR[dayOfWeek];

  const reservationInfo = useContext(ReservationContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isAlreadyDeleted, setIsAlreadyDeleted] = useState(false);
  const [category, setCategory] = useState("");
  const [memo, setMemo] = useState("");
  const [nickname, setNickName] = useState("");
  const [personalName, setPersonalName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [reservationNum, setReservationNum] = useState(null);

  const handleClick = async () => {
    const currentUserEmail = getCurrentUserEmail();
    if (!currentUserEmail) {
      return;
    }

    setIsClicked(true);
    try {
      setIsDeleting(true);
      const docRef = doc(db, reservationInfo.WeekDay, reservationInfo.TimeSlot);
      await deleteDoc(docRef);
      const updatedCount =
        currentDay === reservationInfo.WeekDay ? reservationNum : reservationNum - 1;
      await updateDoc(doc(db, "users", currentUserEmail), {
        ReservationNum: updatedCount,
      });
      setIsDeleting(false);
      setIsAlreadyDeleted(true);
    } catch (error) {
      console.error("Error deleting document:", error);
      setIsDeleting(false);
      alert("Error occurred while deleting the document.");
    }
  };

  useEffect(() => {
    async function fetchFirestoreData() {
      try {
        const currentUserEmail = getCurrentUserEmail();
        let docRef = doc(db, reservationInfo.WeekDay, reservationInfo.TimeSlot);
        let docSnap = await getDoc(docRef, { source: "cache" });
        if (docSnap.exists()) {
          const docData = docSnap.data();
          setCategory(docData.Category);
          setMemo(docData.Memo);
          setNickName(docData.NickName);
          setPersonalName(docData.PersonalName);
          setCanEdit(docData.PostUserMail === currentUserEmail);
        }

        if (!currentUserEmail) {
          setIsLoaded(true);
          return;
        }

        docRef = doc(db, "users", currentUserEmail);
        docSnap = await getDoc(docRef, { source: "cache" });
        if (docSnap.exists()) {
          const docData = docSnap.data();
          setReservationNum(docData.ReservationNum);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchFirestoreData();
  }, [reservationInfo.TimeSlot, reservationInfo.WeekDay]);

  return (
    <>
      <Header />
      <Page className="max-w-2xl">
        {!isLoaded ? (
          <Spinner label="予約内容を読み込んでいます..." />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {reservationInfo.WeekDay}曜日 / {reservationInfo.TimeSlot}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{reservationInfo.Time}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold text-muted-foreground">氏名</TableCell>
                    <TableCell>{personalName || "匿名"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold text-muted-foreground">ユーザ名</TableCell>
                    <TableCell>{nickname}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold text-muted-foreground">カテゴリ</TableCell>
                    <TableCell>{category}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Textarea readOnly value={memo || ""} className="resize-none" />

              {canEdit && !isAlreadyDeleted && !isClicked ? (
                <Button fullWidth variant="destructive" onClick={handleClick} disabled={isDeleting}>
                  消去
                </Button>
              ) : null}

              {isDeleting && !isAlreadyDeleted && isClicked ? (
                <Spinner className="py-2" label="削除しています..." />
              ) : null}

              {isAlreadyDeleted ? (
                <Link to="/reservation" className="block">
                  <Button fullWidth>完了</Button>
                </Link>
              ) : null}

              {!canEdit ? (
                <Link to="/reservation" className="block">
                  <Button fullWidth variant="secondary">
                    部室予約へ
                  </Button>
                </Link>
              ) : null}
            </CardContent>
          </Card>
        )}
      </Page>
      <Footer />
    </>
  );
}

export default ReservationDetail;
