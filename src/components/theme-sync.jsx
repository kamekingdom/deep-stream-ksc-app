import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import {
  applyAppearanceToDocument,
  defaultAppearance,
  dispatchAppearanceChange,
  readStoredAppearance,
  sanitizeAppearance,
  writeStoredAppearance,
} from "../lib/appearance";

function ThemeSync() {
  const [user] = useAuthState(auth);

  useEffect(() => {
    applyAppearanceToDocument(readStoredAppearance());
  }, []);

  useEffect(() => {
    if (!user?.email) {
      applyAppearanceToDocument(defaultAppearance);
      dispatchAppearanceChange();
      return undefined;
    }

    const unsubscribe = onSnapshot(doc(db, "users", user.email), (snapshot) => {
      const appearance = sanitizeAppearance(snapshot.exists() ? snapshot.data() : defaultAppearance);
      writeStoredAppearance(appearance);
      applyAppearanceToDocument(appearance);
      dispatchAppearanceChange();
    });

    return () => unsubscribe();
  }, [user]);

  return null;
}

export default ThemeSync;
