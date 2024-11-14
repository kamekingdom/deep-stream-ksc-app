import React, { useContext, useEffect, useState } from 'react';
import { Footer, Header } from '../PageParts';
import { ReservationContext } from '../App';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import "../css/kame.css";
import { Link } from 'react-router-dom';
import { ref, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

function ReservationDetail() {
  const DAYOFWEEKSTR = ["日", "月", "火", "水", "木", "金", "土"];
  const date = new Date();
  const dayOfWeek = date.getDay();
  const DayOfWeekStr = DAYOFWEEKSTR[dayOfWeek];

  const ReservationInfo = useContext(ReservationContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isAlreadyDeleted, setIsAlreadyDeleted] = useState(false);

  const [category, setCategory] = useState("");
  const [memo, setMemo] = useState("");
  const [nickname, setNickName] = useState("");
  const [personalName, setPersonalName] = useState("");
  const TimeSlot = ReservationInfo.TimeSlot;
  const WeekDay = ReservationInfo.WeekDay;

  const [isDeleting, setIsDeleting] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [reservationNum, setReservationNum] = useState(null);

  const handleClick = async () => {
    setIsClicked(true);
    try {
      setIsDeleting(true);

      // Delete the reservation document from Firestore
      const docRef = doc(db, ReservationInfo.WeekDay, ReservationInfo.TimeSlot);
      await deleteDoc(docRef);

      // Update the user's reservation count
      const updatedCount = (DayOfWeekStr === ReservationInfo.WeekDay) ? reservationNum : reservationNum - 1;
      await updateDoc(doc(db, "users", auth.currentUser.email), {
        ReservationNum: updatedCount
      });

      // Delete the text file from Firebase Storage based on WeekDay, TimeSlot, and personalName
      const storageRef = ref(storage, `reservations/${ReservationInfo.WeekDay}_${ReservationInfo.TimeSlot}_${personalName}.txt`);
      await deleteObject(storageRef)
        .then(() => {
          console.log("Reservation text file deleted from Firebase Storage.");
        })
        .catch((error) => {
          console.error("Error deleting reservation text file:", error);
        });

      setIsDeleting(false);
      setIsAlreadyDeleted(true);
    } catch (error) {
      console.error('Error deleting document:', error);
      setIsDeleting(false);
      alert('Error occurred while deleting the document.');
    }
  };

  useEffect(() => {
    async function fetchFirestoreData() {
      try {
        let docRef = doc(db, ReservationInfo.WeekDay, ReservationInfo.TimeSlot);
        let docSnap = await getDoc(docRef, { source: 'cache' });
        if (docSnap.exists()) {
          const docData = docSnap.data();
          setCategory(docData.Category);
          setMemo(docData.Memo);
          setNickName(docData.NickName);
          setPersonalName(docData.PersonalName);
          setCanEdit(docData.PostUserMail === auth.currentUser.email);
        }

        // Fetch the user's reservation count
        docRef = doc(db, "users", auth.currentUser.email);
        docSnap = await getDoc(docRef, { source: 'cache' });
        if (docSnap.exists()) {
          const docData = docSnap.data();
          setReservationNum(docData.ReservationNum);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchFirestoreData();
  }, []);

  if (!isLoaded) {
    return (
      <>
        <Header />
        <div className="loader">Loading...</div>
        <Footer />
      </>
    );
  } else {
    return (
      <>
        <Header />
        <div className="kame_header_003">
          <p className="kame_font_003">{WeekDay}曜日</p>
        </div>
        <p className="kame_font_003">{TimeSlot} ({ReservationInfo.Time})</p>

        <center>
          <table className="kame_table_001">
            <tr>
              <th><p className="kame_font_002">氏名</p></th>
              <td><p className="kame_font_002">{personalName || "匿名"}</p></td>
            </tr>
            <tr>
              <th><p className="kame_font_002">ユーザ名</p></th>
              <td><p className="kame_font_002">{nickname}</p></td>
            </tr>
            <tr>
              <th><p className="kame_font_002">カテゴリ</p></th>
              <td><p className="kame_font_002">{category}</p></td>
            </tr>
          </table>
          <br /><br />
          <textarea className="kame_textarea" placeholder={memo} readOnly />
          <br /><br /><br />
        </center>

        {canEdit && !isAlreadyDeleted && !isClicked &&
          <button className="kame_button_light_blue" onClick={handleClick} disabled={isDeleting}>
            <p className="kame_font_002">消去</p>
          </button>
        }
        {isDeleting && !isAlreadyDeleted && isClicked &&
          <div className="loader">Loading...</div>
        }
        {isLoaded && isAlreadyDeleted &&
          <Link to="/reservation" className="kame_button_light_blue">
            <p className="kame_font_002">完了</p>
          </Link>
        }
        {!canEdit &&
          <Link className="kame_button_light_blue" to="/reservation">
            <p className="kame_font_002">部室予約へ</p>
          </Link>
        }

        <Footer />
      </>
    );
  }
}

export default ReservationDetail;
