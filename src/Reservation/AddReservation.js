import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { Footer, Header } from "../PageParts";
import { ReservationContext } from "../App";
import { db, auth } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import { Textarea } from "../components/ui/textarea";

const DAYOFWEEKSTR = ["日", "月", "火", "水", "木", "金", "土"];

function AddReservation() {
  const date = new Date();
  const dayOfWeek = date.getDay();
  const currentDay = DAYOFWEEKSTR[dayOfWeek];
  const reservationInfo = useContext(ReservationContext);

  const [category, setCategory] = useState("バンド");
  const [memo, setMemo] = useState("");
  const [isAlreadyUploaded, setIsAlreadyUploaded] = useState(false);
  const [isAlreadyExisted, setIsAlreadyExisted] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [nickname, setNickName] = useState("");
  const [personalName, setPersonalName] = useState("");
  const [reservationNum, setReservationNum] = useState(null);
  const [canReserve, setCanReserve] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchFirestoreData() {
      const docRef = doc(db, "users", auth.currentUser.email);
      const docSnap = await getDoc(docRef, { source: "cache" });
      if (docSnap.exists()) {
        const docData = docSnap.data();
        setNickName(docData.NickName);
        setPersonalName(docData.PersonalName);
        setReservationNum(docData.ReservationNum);
        setCanReserve(
          isNaN(docData.ReservationNum) ||
            docData.ReservationNum === undefined ||
            docData.ReservationNum === null
            ? true
            : docData.ReservationNum <= 1 || currentDay === reservationInfo.WeekDay
        );
      }
      setIsLoaded(true);
    }
    fetchFirestoreData();
  }, [currentDay, reservationInfo.WeekDay]);

  const handleUploadClick = async () => {
    const timeSlot = reservationInfo.TimeSlot;
    const weekDay = reservationInfo.WeekDay;
    const postDocRef = doc(db, weekDay, timeSlot);
    const userDocRef = doc(db, "users", auth.currentUser.email);

    const reservationExists = await getDoc(postDocRef);
    if (reservationExists.exists()) {
      setIsAlreadyExisted(true);
      setIsClicked(false);
      return;
    }

    let count = 0;
    if (currentDay === reservationInfo.WeekDay) {
      count = reservationNum;
    } else if (isNaN(reservationNum) || reservationNum <= 0) {
      count = 1;
    } else {
      count = reservationNum + 1;
    }

    const userDocSnap = await getDoc(userDocRef, { source: "cache" });
    if (userDocSnap.exists()) {
      await updateDoc(userDocRef, { ReservationNum: count });
    } else {
      await setDoc(userDocRef, { ReservationNum: count });
    }

    await setDoc(postDocRef, {
      PostUserMail: auth.currentUser.email,
      WeekDay: reservationInfo.WeekDay,
      TimeSlot: reservationInfo.TimeSlot,
      PersonalName: personalName,
      Category: category,
      Memo: memo,
      NickName: nickname,
    });

    setIsAlreadyUploaded(true);
    setIsClicked(false);
  };

  const postButtonClick = async () => {
    setIsClicked(true);
    await handleUploadClick();
  };

  return (
    <>
      <Header />
      <Page className="max-w-2xl">
        {!isLoaded ? (
          <Spinner label="予約情報を読み込んでいます..." />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {reservationInfo.WeekDay}曜日 / {reservationInfo.TimeSlot}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{reservationInfo.Time}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">練習カテゴリ</p>
                <select
                  className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setIsAlreadyUploaded(false);
                    setIsClicked(false);
                  }}
                >
                  <option value="バンド">バンド</option>
                  <option value="個人">個人</option>
                  <option value="パート">パート</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">メモ</p>
                <Textarea
                  placeholder="(例) ずっと真夜中でいいのに。"
                  maxLength={20}
                  value={memo}
                  onChange={(e) => {
                    setMemo(e.target.value);
                    setIsAlreadyUploaded(false);
                    setIsClicked(false);
                  }}
                />
              </div>

              {!canReserve ? <p className="text-sm font-medium text-destructive">予約は週に2回までです。</p> : null}
              {isAlreadyExisted ? <p className="text-sm font-medium text-destructive">既に予約されています。</p> : null}

              {isClicked && !isAlreadyUploaded ? <Spinner className="py-2" label="予約を確定しています..." /> : null}

              {canReserve && !isAlreadyUploaded && !isClicked ? (
                <Button fullWidth onClick={postButtonClick}>
                  予約
                </Button>
              ) : null}

              {isAlreadyUploaded ? (
                <Link to="/reservation" className="block">
                  <Button fullWidth>完了</Button>
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

export default AddReservation;
