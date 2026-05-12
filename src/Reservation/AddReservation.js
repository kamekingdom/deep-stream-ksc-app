import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { Footer, Header } from "../PageParts";
import { ReservationContext } from "../App";
import { db } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import { Textarea } from "../components/ui/textarea";
import { getCurrentUserEmail } from "../lib/session-auth";

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
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchFirestoreData() {
      const currentUserEmail = getCurrentUserEmail();
      const reservationDocRef = doc(db, reservationInfo.WeekDay, reservationInfo.TimeSlot);

      const reservationDocSnap = await getDoc(reservationDocRef);
      if (reservationDocSnap.exists()) {
        const reservationDocData = reservationDocSnap.data();
        if (reservationDocData.IsBlocked) {
          setIsBlocked(true);
          setBlockMessage(
            reservationDocData.BlockReason
            || reservationDocData.Memo
            || "管理者によって予約できないように設定されています。"
          );
        } else {
          setIsBlocked(false);
          setBlockMessage("");
        }
      } else {
        setIsBlocked(false);
        setBlockMessage("");
      }

      if (!currentUserEmail) {
        setIsLoaded(true);
        return;
      }

      const docRef = doc(db, "users", currentUserEmail);
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
  }, [currentDay, reservationInfo.TimeSlot, reservationInfo.WeekDay]);

  const handleUploadClick = async () => {
    const currentUserEmail = getCurrentUserEmail();
    if (!currentUserEmail) {
      setIsClicked(false);
      return;
    }

    const timeSlot = reservationInfo.TimeSlot;
    const weekDay = reservationInfo.WeekDay;
    const postDocRef = doc(db, weekDay, timeSlot);
    const userDocRef = doc(db, "users", currentUserEmail);

    const reservationExists = await getDoc(postDocRef);
    if (reservationExists.exists()) {
      const reservationData = reservationExists.data();
      if (reservationData.IsBlocked) {
        setIsBlocked(true);
        setBlockMessage(
          reservationData.BlockReason
          || reservationData.Memo
          || "管理者によって予約できないように設定されています。"
        );
        setIsClicked(false);
        return;
      }

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
      PostUserMail: currentUserEmail,
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
              <CardTitle className="leading-tight">
                {reservationInfo.WeekDay}曜日 / {reservationInfo.TimeSlot}
              </CardTitle>
              <p className="text-[1rem] font-medium text-muted-foreground sm:text-[1.1rem]">
                {reservationInfo.Time}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-base font-semibold text-muted-foreground">練習カテゴリ</p>
                <select
                  className="flex h-14 w-full rounded-xl border border-input bg-background px-4 text-[1.1rem] font-medium text-foreground"
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
                <p className="text-base font-semibold text-muted-foreground">メモ</p>
                <Textarea
                  placeholder="(例) ずっと真夜中でいいのに。"
                  maxLength={20}
                  value={memo}
                  className="min-h-[160px] rounded-xl px-4 py-4 text-[1.05rem]"
                  onChange={(e) => {
                    setMemo(e.target.value);
                    setIsAlreadyUploaded(false);
                    setIsClicked(false);
                  }}
                />
              </div>

              {!canReserve ? <p className="text-base font-medium text-destructive">予約は週に2回までです。</p> : null}
              {isBlocked ? <p className="text-base font-medium text-destructive">{blockMessage}</p> : null}
              {isAlreadyExisted ? <p className="text-base font-medium text-destructive">既に予約されています。</p> : null}

              {isClicked && !isAlreadyUploaded ? <Spinner className="py-3" label="予約を確定しています..." /> : null}

              {canReserve && !isBlocked && !isAlreadyExisted && !isAlreadyUploaded && !isClicked ? (
                <Button fullWidth size="lg" onClick={postButtonClick}>
                  予約
                </Button>
              ) : null}

              {(isBlocked || isAlreadyExisted) && !isAlreadyUploaded ? (
                <Link to="/reservation" className="block">
                  <Button fullWidth size="lg" variant="secondary">部室予約へ戻る</Button>
                </Link>
              ) : null}

              {isAlreadyUploaded ? (
                <Link to="/reservation" className="block">
                  <Button fullWidth size="lg">完了</Button>
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
