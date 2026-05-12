import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { Footer, Header } from "../PageParts";
import { auth, db } from "../firebase";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";
import { Spinner } from "../components/ui/spinner";
import { Table, TableBody, TableCell, TableRow } from "../components/ui/table";

function Key() {
  const [name, setName] = useState("");
  const [nickname, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [time, setTime] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchFirestoreData() {
      const docRef = doc(db, "Key", "Holder");
      const docSnap = await getDoc(docRef, { source: "cache" });
      if (docSnap.exists()) {
        const docData = docSnap.data();
        setName(docData.name);
        setNickName(docData.nickname);
        setEmail(docData.email);
        setTime(docData.time);
      }
      setIsLoaded(true);
    }
    fetchFirestoreData();
  }, []);

  const isUsing = Boolean(name);
  const isCurrentUserHolder = email === auth.currentUser?.email;

  return (
    <>
      <Header />
      <Page>
        <PageHero
          eyebrow="Key Status"
          title="鍵の場所"
          description="現在の所持者と最終利用時刻を確認し、必要に応じて利用開始・返却に進めます。"
        />
        {!isLoaded ? (
          <Spinner label="鍵の状態を読み込んでいます..." />
        ) : (
          <Card>
            <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>現在のステータス</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isUsing ? "鍵は現在利用中です。" : "鍵は現在利用可能です。"}
                </p>
              </div>
              <Badge variant={isUsing ? "destructive" : "default"} className="w-fit">
                {isUsing ? "利用中" : "利用可能"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold text-muted-foreground">
                      {isUsing ? "所持者" : "最終利用"}
                    </TableCell>
                    <TableCell>{name || "管理人さん"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold text-muted-foreground">ニックネーム</TableCell>
                    <TableCell>{nickname || "記録なし"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold text-muted-foreground">
                      {isUsing ? "開始時刻" : "返却時刻"}
                    </TableCell>
                    <TableCell>{time || "記録なし"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Link to="/key-access" className="block">
                <Button fullWidth variant={isCurrentUserHolder ? "destructive" : "default"}>
                  {isCurrentUserHolder ? "返却" : "利用開始"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </Page>
      <Footer />
    </>
  );
}

export default Key;
