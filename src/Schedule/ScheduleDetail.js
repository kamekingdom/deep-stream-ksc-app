import React, { useContext } from "react";
import { Footer, Header } from "../PageParts";
import { ScheduleContext } from "../App";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page } from "../components/page";
import { Textarea } from "../components/ui/textarea";

function ScheduleDetail() {
  const scheduleInfo = useContext(ScheduleContext);
  const categoryLabels = ["メモ", "注意", "アンケート", "確認"];

  return (
    <>
      <Header />
      <Page className="max-w-3xl">
        <Card>
          <CardHeader className="space-y-4">
            <Badge className="w-fit">{categoryLabels[scheduleInfo.Category] || "予定"}</Badge>
            <CardTitle className="text-2xl">{scheduleInfo.Title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {scheduleInfo.Month}/{scheduleInfo.Date}({scheduleInfo.Day})
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea readOnly value={scheduleInfo.Content || ""} className="min-h-[220px] resize-none" />
            {scheduleInfo.Link ? (
              <a
                href={scheduleInfo.Link}
                className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                {scheduleInfo.Link}
              </a>
            ) : null}
          </CardContent>
        </Card>
      </Page>
      <Footer />
    </>
  );
}

export default ScheduleDetail;
