import { useState, useEffect, useContext } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { Footer, Header } from "../PageParts";
import { ScheduleContext } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Page, PageHero } from "../components/page";

const categoryMeta = [
  { label: "メモ", variant: "secondary" },
  { label: "注意", variant: "destructive" },
  { label: "アンケート", variant: "default" },
  { label: "確認", variant: "outline" },
];

const Calendar = () => {
  const [filePosts, setFilePosts] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const scheduleInfo = useContext(ScheduleContext);

  useEffect(() => {
    const fetchFilePosts = async () => {
      const filePostsCollectionRef = collection(db, "Schedules");
      const q = query(filePostsCollectionRef, orderBy("__name__"));
      const filePostsSnapshot = await getDocs(q);
      const filePostsData = filePostsSnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setFilePosts(filePostsData);
    };
    fetchFilePosts();
  }, []);

  return (
    <>
      <Header />
      <Page>
        <PageHero
          eyebrow="Schedule"
          title={`${currentMonth}月の予定`}
          description="月を切り替えながら、公開されているイベント予定を確認できます。"
        />
        <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => {
            const month = index + 1;
            return (
              <Button
                key={month}
                variant={currentMonth === month ? "default" : "secondary"}
                onClick={() => setCurrentMonth(month)}
                className="rounded-2xl"
              >
                {month}月
              </Button>
            );
          })}
        </div>
        <div className="space-y-4">
          {filePosts
            .filter((filePost) => filePost.month === currentMonth)
            .map((filePost) => {
              const meta = categoryMeta[filePost.category] || categoryMeta[0];
              return (
                <Card key={filePost.id}>
                  <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {filePost.month}/{filePost.day}({filePost.dayofweek})
                      </p>
                      <CardTitle className="mt-1 text-lg">
                        <Link
                          to="/scheduledetail"
                          className="text-primary underline-offset-4 hover:underline"
                          onClick={() => {
                            scheduleInfo.Month = filePost.month;
                            scheduleInfo.Date = filePost.day;
                            scheduleInfo.Day = filePost.dayofweek;
                            scheduleInfo.Title = filePost.title;
                            scheduleInfo.Content = filePost.content;
                            scheduleInfo.Link = filePost.link;
                            scheduleInfo.Category = filePost.category;
                          }}
                        >
                          {filePost.title}
                        </Link>
                      </CardTitle>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </CardHeader>
                  {filePost.content ? (
                    <CardContent className="pt-0 text-sm text-muted-foreground">
                      {filePost.content.slice(0, 120)}
                      {filePost.content.length > 120 ? "..." : ""}
                    </CardContent>
                  ) : null}
                </Card>
              );
            })}
        </div>
      </Page>
      <Footer />
    </>
  );
};

export default Calendar;
