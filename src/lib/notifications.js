const NOTIFICATION_STATE_KEY = "deepstream_notification_state";
const TIME_SLOT_LIST = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];
const TIME_SLOT_SCHEDULE = {
  朝練: { start: "08:00", end: "08:50" },
  "１限": { start: "09:00", end: "10:40" },
  チャペル: { start: "10:40", end: "11:10" },
  "２限": { start: "11:10", end: "12:50" },
  昼練: { start: "12:50", end: "13:30" },
  "３限": { start: "13:30", end: "15:10" },
  "４限": { start: "15:20", end: "17:00" },
  "５限": { start: "17:05", end: "18:45" },
  夜練Ⅰ: { start: "18:50", end: "19:50" },
  夜練Ⅱ: { start: "20:00", end: "21:00" },
};
const DAY_OF_WEEK_LIST = ["日", "月", "火", "水", "木", "金", "土"];

function canUseNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

function getNotificationPermission() {
  if (!canUseNotifications()) {
    return "unsupported";
  }

  return Notification.permission;
}

async function requestNotificationPermission() {
  if (!canUseNotifications()) {
    return "unsupported";
  }

  return Notification.requestPermission();
}

function readNotificationState() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(NOTIFICATION_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function writeNotificationState(state) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(state));
}

function markNotificationSent(notificationKey) {
  const state = readNotificationState();
  state[notificationKey] = true;
  writeNotificationState(state);
}

function wasNotificationSent(notificationKey) {
  return Boolean(readNotificationState()[notificationKey]);
}

function clearOldNotificationState(todayKey) {
  const state = readNotificationState();
  const nextState = Object.fromEntries(
    Object.entries(state).filter(([key, value]) => key.startsWith(todayKey) && value)
  );
  writeNotificationState(nextState);
}

function getTodayWeekday() {
  return DAY_OF_WEEK_LIST[new Date().getDay()];
}

function buildTodayDateTime(timeText) {
  const [hours, minutes] = timeText.split(":").map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  return target;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getTodayReservationNotifications(reservations) {
  const now = new Date();
  const todayKey = getTodayKey();

  return reservations.flatMap((reservation) => {
    const schedule = TIME_SLOT_SCHEDULE[reservation.timeSlot];
    if (!schedule) {
      return [];
    }

    const startAt = buildTodayDateTime(schedule.start);
    const endAt = buildTodayDateTime(schedule.end);
    const tenMinutesBeforeStart = new Date(startAt.getTime() - 10 * 60 * 1000);

    const notifications = [];

    if (now >= tenMinutesBeforeStart && now < startAt) {
      notifications.push({
        key: `${todayKey}:${reservation.timeSlot}:start`,
        title: "部室利用の準備",
        body: `${reservation.timeSlot} の予約が10分後に始まります。「利用開始」を押してください。`,
        path: "/key",
      });
    }

    if (now >= endAt && now < new Date(endAt.getTime() + 10 * 60 * 1000)) {
      notifications.push({
        key: `${todayKey}:${reservation.timeSlot}:end`,
        title: "部室利用の返却",
        body: `${reservation.timeSlot} の予約時間が終了しました。「返却」を押してください。`,
        path: "/key",
      });
    }

    return notifications;
  });
}

function showBrowserNotification({ title, body, path }) {
  if (!canUseNotifications() || Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(title, {
    body,
    tag: `${title}:${path}`,
    renotify: false,
  });

  notification.onclick = () => {
    window.focus();
    window.location.assign(path);
    notification.close();
  };
}

function getTimeSlotList() {
  return TIME_SLOT_LIST;
}

export {
  canUseNotifications,
  clearOldNotificationState,
  getNotificationPermission,
  getTimeSlotList,
  getTodayReservationNotifications,
  getTodayWeekday,
  markNotificationSent,
  requestNotificationPermission,
  showBrowserNotification,
  wasNotificationSent,
};
