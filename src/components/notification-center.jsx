import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getCurrentUserEmail, useCurrentUser } from "../lib/session-auth";
import {
  clearOldNotificationState,
  getNotificationPermission,
  getTimeSlotList,
  getTodayReservationNotifications,
  getTodayWeekday,
  isNotificationEnabled,
  markNotificationSent,
  requestNotificationPermission,
  showBrowserNotification,
  wasNotificationSent,
} from "../lib/notifications";

async function fetchTodayReservations(email) {
  const weekday = getTodayWeekday();
  const reservations = await Promise.all(
    getTimeSlotList().map(async (timeSlot) => {
      const snapshot = await getDoc(doc(db, weekday, timeSlot));
      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      if (data.PostUserMail !== email) {
        return null;
      }

      return {
        timeSlot,
        weekDay: weekday,
      };
    })
  );

  return reservations.filter(Boolean);
}

function NotificationCenter() {
  const [user] = useCurrentUser();
  const [permission, setPermission] = useState(getNotificationPermission());
  const [enabled, setEnabled] = useState(isNotificationEnabled());

  useEffect(() => {
    setPermission(getNotificationPermission());
    setEnabled(isNotificationEnabled());
  }, [user]);

  useEffect(() => {
    const syncNotificationSettings = () => {
      setPermission(getNotificationPermission());
      setEnabled(isNotificationEnabled());
    };

    window.addEventListener("focus", syncNotificationSettings);
    document.addEventListener("visibilitychange", syncNotificationSettings);

    return () => {
      window.removeEventListener("focus", syncNotificationSettings);
      document.removeEventListener("visibilitychange", syncNotificationSettings);
    };
  }, []);

  useEffect(() => {
    if (!user?.email || !enabled || permission !== "default") {
      return undefined;
    }

    let cancelled = false;

    const requestPermission = async () => {
      try {
        const nextPermission = await requestNotificationPermission();
        if (!cancelled) {
          setPermission(nextPermission);
        }
      } catch (_error) {
        if (!cancelled) {
          setPermission(getNotificationPermission());
        }
      }
    };

    requestPermission();

    return () => {
      cancelled = true;
    };
  }, [enabled, permission, user]);

  useEffect(() => {
    if (!user?.email || !enabled || permission !== "granted") {
      return undefined;
    }

    let isMounted = true;

    const runCheck = async () => {
      try {
        const currentUserEmail = getCurrentUserEmail();
        if (!currentUserEmail) {
          return;
        }

        const todayKey = new Date().toISOString().slice(0, 10);
        clearOldNotificationState(todayKey);

        const reservations = await fetchTodayReservations(currentUserEmail);
        const notifications = getTodayReservationNotifications(reservations);

        if (!isMounted) {
          return;
        }

        notifications.forEach((notification) => {
          if (wasNotificationSent(notification.key)) {
            return;
          }

          showBrowserNotification(notification);
          markNotificationSent(notification.key);
        });
      } catch (error) {
        console.error("Notification check failed:", error);
      }
    };

    runCheck();
    const intervalId = window.setInterval(runCheck, 60 * 1000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [enabled, permission, user]);

  return null;
}

export default NotificationCenter;
