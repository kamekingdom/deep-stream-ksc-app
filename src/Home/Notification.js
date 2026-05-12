import React, { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { Footer, Header } from "../PageParts";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";

const categoryMeta = [
  { label: "メモ", emoji: "📒", variant: "secondary" },
  { label: "注意", emoji: "⚠", variant: "destructive" },
  { label: "アンケート", emoji: "📝", variant: "default" },
  { label: "確認", emoji: "☑", variant: "outline" },
];

function Notification() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postsCollection = collection(db, "NotificationPosts");
    const q = query(postsCollection, orderBy("__name__"), limit(10));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postData = querySnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setPosts(postData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Header />
      <Page>
        <PageHero
          eyebrow="Updates"
          title="提出書類・お知らせ"
          description="直近のお知らせをカテゴリ付きで確認できます。"
        />
        <div className="space-y-4">
          {posts.slice().reverse().map((post) => {
            const meta = categoryMeta[post.Category] || categoryMeta[0];
            return (
              <Card key={post.id}>
                <CardHeader className="space-y-3">
                  <Badge variant={meta.variant} className="w-fit">
                    {meta.emoji} {meta.label}
                  </Badge>
                  <CardTitle>{post.Title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                  <p className="whitespace-pre-wrap text-foreground">{post.Content}</p>
                  {post.Link ? (
                    <a
                      href={post.Link}
                      className="inline-flex font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      {post.Link}
                    </a>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Page>
      <Footer />
    </>
  );
}

export default Notification;
