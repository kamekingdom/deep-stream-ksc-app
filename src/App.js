import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import HomePage from "./Home/HomePage";
import Login from "./Register/Login";
import Register from "./Register/Register";
import TermsOfService from "./Document/TermsOfService";
import Calendar from "./Home/Calendar";
import Reservation from "./Home/Reservation";
import Notification from "./Home/Notification";
import FindPassword from "./Register/FindPassword";
import Key from "./Home/Key";
import Tool from "./Home/Tool";
import AddReservation from "./Reservation/AddReservation";
import { createContext, useCallback, useEffect } from "react";
import ReservationDetail from "./Reservation/ReservationDetail";
import AdminEventPost from "./Administrator/AdminEventPost";
import AdminHome from "./Administrator/AdminHome";
import AdminLogin from "./Administrator/AdminLogin";
import AlertReservation from "./Reservation/AlertReservation";
import AdminSchedulePost from "./Administrator/AdminSchedulePost";
import ScheduleDetail from "./Schedule/ScheduleDetail";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import UserProfile from "./Register/UserProfile";
import CreateReservationSettings from "./Administrator/CreateReservationSettings";
import CreateReservationTemplate from "./Administrator/CreateReservationTemplate";
import ReservationStatusPage from "./Administrator/ReservationStatusPage";
import FixTimeSlots from "./Administrator/FixTimeSlots";
import UploadPage from "./Administrator/UploadPage";

const SettingInfo = {
  Year: "2023"
}

const ScheduleInfo = {
  Month: "",
  Date: "",
  Day: "",
  Title: "",
  Content: "",
  Link: "",
  Category: "",
}

const ReservationInfo = {
  NickName: "",   // 予約ユーザー名(v)
  PersonalName: "", // 個人氏名
  UserEmail: "",  // 予約メール
  WeekDay: "",    // 曜日(v)
  TimeSlot: "",   // 時間帯(「朝練」的な)(v)
  Time: "",        // 時間帯(「9:00 ~ 10:00」的な)(v)
  Category: "",   // カテゴリ
  Memo: "",       // メモ
}


export const ScheduleContext = createContext(ScheduleInfo);
export const ReservationContext = createContext(ReservationInfo);
export const SettingContext = createContext(SettingInfo);

function App() {
  return (
    <>
      <Router basename="/">
        <Routes>
          <Route exact path="/" element={<HomePage />}></Route>
          <Route exact path="/reservation" element={<Reservation />}></Route>
          <Route exact path="/addreservation" element={<AddReservation />}></Route>
          <Route exact path="/reservationdetail" element={<ReservationDetail />}></Route>
          <Route exact path="/alertreservation" element={<AlertReservation />}></Route>

          <Route exact path="/admineventpost" element={<AdminEventPost />}></Route>
          <Route exact path="/adminschedulepost" element={<AdminSchedulePost />}></Route>
          <Route exact path="/adminhome" element={<AdminHome />}></Route>
          <Route exact path="/adminlogin" element={<AdminLogin />}></Route>
          <Route exact path="/create-reservation-settings" element={<CreateReservationSettings />}></Route>
          <Route exact path="/create-reservation-template" element={<CreateReservationTemplate />}></Route>
          <Route exact path="/reservation-check" element={<ReservationStatusPage />}></Route>
          <Route exact path="/fix-time-slots" element={<FixTimeSlots />}></Route>
          <Route exact path="/upload-page" element={<UploadPage />}></Route>

          <Route exact path="/calendar" element={<Calendar />}></Route>
          <Route exact path="/key" element={<Key />}></Route>
          <Route exact path="/scheduleDetail" element={<ScheduleDetail />}></Route>
          <Route exact path="/notification" element={<Notification />}></Route>
          <Route exact path="/tool" element={<Tool />}></Route>

          <Route exact path="/login" element={<Login />}></Route>

          <Route exact path="/login" element={<Login />}></Route>
          <Route exact path="/register" element={<Register />}></Route>
          <Route exact path="/userprofile" element={<UserProfile />}></Route>
          <Route exact path="/termsofservice" element={<TermsOfService />}></Route>

          <Route exact path="/findpassword" element={<FindPassword />}></Route>

        </Routes>
      </Router>
    </>
  );
}

function useBlockBrowserBack() {
  const blockBrowserBack = useCallback(() => {
    alert("このページはブラウザバックが禁止されています。");
    window.history.go(1)
  }, [])
  useEffect(() => {
    const handleBlockBrowserBack = (event) => {
      event.preventDefault();
      blockBrowserBack();
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handleBlockBrowserBack);

    return () => {
      window.removeEventListener('popstate', handleBlockBrowserBack);
    };
  }, []);
}

async function isUserDocumentExists(auth) {
  const firestore = getFirestore();
  const userDocRef = doc(firestore, 'users', auth.currentUser.email);
  const docSnap = await getDoc(userDocRef);

  return docSnap.exists();
}

export { App, useBlockBrowserBack, isUserDocumentExists };