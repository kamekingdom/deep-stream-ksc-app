import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Spinner } from "../components/ui/spinner";
import { Page } from "../components/page";
import { useCurrentUser } from "../lib/session-auth";

function KeyAccess() {
  const [user, loading] = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAccess = async () => {
      if (loading) return;
      if (!user) {
        navigate("/login");
        return;
      }

      const userDocRef = doc(db, "users", user.email);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        console.error("User document does not exist");
        return;
      }
      const userData = userDocSnap.data();
      const personalName = userData.PersonalName || "";
      const nickName = userData.NickName || "";

      const keyDocRef = doc(db, "Key", "Holder");
      const keyDocSnap = await getDoc(keyDocRef, { source: "cache" });

      if (keyDocSnap.exists()) {
        const keyData = keyDocSnap.data();
        if (keyData.email === user.email) {
          await updateDoc(keyDocRef, {
            email: null,
            image: null,
            name: null,
            nickname: nickName,
            time: new Date().toLocaleString(),
          });
        } else {
          await updateDoc(keyDocRef, {
            email: user.email,
            image: user.photoURL || null,
            name: personalName,
            nickname: nickName,
            time: new Date().toLocaleString(),
          });
        }
      } else {
        await setDoc(keyDocRef, {
          email: user.email,
          image: user.photoURL || null,
          name: personalName,
          nickname: nickName,
          time: new Date().toLocaleString(),
        });
      }

      navigate("/key");
    };

    handleAccess();
  }, [user, loading, navigate]);

  return (
    <Page className="flex min-h-screen items-center justify-center">
      <Spinner label="鍵情報を更新しています..." />
    </Page>
  );
}

export default KeyAccess;
