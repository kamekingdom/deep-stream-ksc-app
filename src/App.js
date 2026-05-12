import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Register/Login";
import Register from "./Register/Register";
import TermsOfService from "./Document/TermsOfService";
import Reservation from "./Home/Reservation";
import FindPassword from "./Register/FindPassword";
import Key from "./Home/Key";
import Tool from "./Home/Tool";
import AddReservation from "./Reservation/AddReservation";
import { createContext } from "react";
import ReservationDetail from "./Reservation/ReservationDetail";
import AdminHome from "./Administrator/AdminHome";
import AdminLogin from "./Administrator/AdminLogin";
import AlertReservation from "./Reservation/AlertReservation";
import CreateReservationSettings from "./Administrator/CreateReservationSettings";
import CreateReservationTemplate from "./Administrator/CreateReservationTemplate";
import ReservationStatusPage from "./Administrator/ReservationStatusPage";
import FixTimeSlots from "./Administrator/FixTimeSlots";
import KeyAccess from "./Home/KeyAccess";
import ReservationPreview from "./Home/ReservationPreview";
import { isAdminAuthorized } from "./lib/admin";
import { useCurrentUser } from "./lib/session-auth";

const SettingInfo = {
  Year: "2023"
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

export const ReservationContext = createContext(ReservationInfo);
export const SettingContext = createContext(SettingInfo);

function RequireAdmin({ children }) {
  return isAdminAuthorized() ? children : <Navigate to="/adminlogin" replace />;
}

function RequireLogin({ children }) {
  const [user, loading] = useCurrentUser();

  if (loading) {
    return null;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function LandingRedirect() {
  const [user, loading] = useCurrentUser();

  if (loading) {
    return null;
  }

  return <Navigate to={user ? "/reservation" : "/login"} replace />;
}

function App() {
  return (
    <>
      <Router basename="/">
        <Routes>
          <Route exact path="/" element={<LandingRedirect />}></Route>
          <Route exact path="/reservation" element={<RequireLogin><Reservation /></RequireLogin>}></Route>
          <Route exact path="/reservation-preview" element={<RequireLogin><ReservationPreview /></RequireLogin>}></Route>
          <Route exact path="/addreservation" element={<RequireLogin><AddReservation /></RequireLogin>}></Route>
          <Route exact path="/reservationdetail" element={<RequireLogin><ReservationDetail /></RequireLogin>}></Route>
          <Route exact path="/alertreservation" element={<RequireLogin><AlertReservation /></RequireLogin>}></Route>

          <Route exact path="/adminhome" element={<RequireAdmin><AdminHome /></RequireAdmin>}></Route>
          <Route exact path="/adminlogin" element={<AdminLogin />}></Route>
          <Route exact path="/create-reservation-settings" element={<RequireAdmin><CreateReservationSettings /></RequireAdmin>}></Route>
          <Route exact path="/create-reservation-template" element={<RequireAdmin><CreateReservationTemplate /></RequireAdmin>}></Route>
          <Route exact path="/reservation-check" element={<RequireAdmin><ReservationStatusPage /></RequireAdmin>}></Route>
          <Route exact path="/fix-time-slots" element={<RequireAdmin><FixTimeSlots /></RequireAdmin>}></Route>

          <Route exact path="/key" element={<RequireLogin><Key /></RequireLogin>}></Route>
          <Route exact path="/key-access" element={<RequireLogin><KeyAccess /></RequireLogin>}></Route>
          <Route exact path="/tool" element={<RequireLogin><Tool /></RequireLogin>}></Route>

          <Route exact path="/login" element={<Login />}></Route>
          <Route exact path="/register" element={<Register />}></Route>
          <Route exact path="/userprofile" element={<Navigate to="/tool" replace />}></Route>
          <Route exact path="/termsofservice" element={<TermsOfService />}></Route>

          <Route exact path="/findpassword" element={<FindPassword />}></Route>

        </Routes>
      </Router>
    </>
  );
}

export { App };
