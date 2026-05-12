import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Footer, Header } from "../PageParts";
import { ReservationContext } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page } from "../components/page";
import { Textarea } from "../components/ui/textarea";

function AlertReservation() {
  const reservationInfo = useContext(ReservationContext);

  return (
    <div>
      <Header />
      <Page className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>
              {reservationInfo.WeekDay}曜日 / {reservationInfo.TimeSlot}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">{reservationInfo.Time}</p>
            <Textarea
              readOnly
              value={
                reservationInfo.Category === "予約不可"
                  ? reservationInfo.Memo || "管理者によって予約できないように設定されています。"
                  : "※過去の投稿は編集できません"
              }
              className="resize-none"
            />
            <Link to="/reservation" className="block">
              <Button fullWidth>部室予約へ</Button>
            </Link>
          </CardContent>
        </Card>
      </Page>
      <Footer />
    </div>
  );
}

export default AlertReservation;
