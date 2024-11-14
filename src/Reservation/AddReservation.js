import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { Footer, Header } from '../PageParts';
import { ReservationContext, useBlockBrowserBack } from '../App';
import '../css/kame.css';
import { ref, uploadString } from 'firebase/storage';
import { db, auth, storage } from '../firebase'; // Import storage from Firebase setup


const DAYOFWEEKSTR = ["日", "月", "火", "水", "木", "金", "土"];

function AddReservation() {
    var date = new Date();
    var dayOfWeek = date.getDay();
    var DayOfWeekStr = DAYOFWEEKSTR[dayOfWeek];

    const [category, setCategory] = useState("バンド");
    const [memo, setMemo] = useState(null);
    const [isalreadyuploaded, setIsAlreadyUploaded] = useState(false);
    const [isAlreadyExisted, setIsAlreadyExisted] = useState(false);
    const [isclicked, setIsClicked] = useState(false);

    const handleSelectChange1 = (e) => { setCategory(e.target.value); setIsAlreadyUploaded(false); setIsClicked(false); }
    const handleSelectChange3 = (e) => { setMemo(e.target.value); setIsAlreadyUploaded(false); setIsClicked(false); }

    function PostButtonClick() {
        setIsClicked(true);
        handleUploadClick();
    }

    const [nickname, setNickName] = useState("");
    const [personalname, setPersonalName] = useState("");
    const [reservationNum, setReservationNum] = useState(null);
    const [canReserve, setCanReserve] = useState(true);

    const [isloaded, setIsLoaded] = useState(false)
    useEffect(() => {
        async function fetchFirestoreData() {
            const docRef = doc(db, 'users', auth.currentUser.email);
            const docSnap = await getDoc(docRef, { source: 'cache' });
            if (docSnap.exists()) {
                const docData = docSnap.data();
                setNickName(docData.NickName);
                setPersonalName(docData.PersonalName);
                setReservationNum(docData.ReservationNum);
                setCanReserve(
                    isNaN(docData.ReservationNum) ||
                        docData.ReservationNum === undefined ||
                        docData.ReservationNum === null
                        ? true
                        : docData.ReservationNum <= 1 || DayOfWeekStr === ReservationInfo.WeekDay
                );
            }
            setIsLoaded(true);
        }
        fetchFirestoreData();
    }, []);

    const ReservationInfo = useContext(ReservationContext);

    const handleUploadClick = async (e) => {
        const TimeSlot = ReservationInfo.TimeSlot;
        const WeekDay = ReservationInfo.WeekDay;

        // Firestore references
        const postDocRef = doc(db, WeekDay, TimeSlot);
        const userDocRef = doc(db, "users", auth.currentUser.email);

        // Check if reservation already exists
        const reservationExists = await getDoc(postDocRef);
        if (reservationExists.exists()) {
            setIsAlreadyExisted(true);
            return;
        }

        let count = 0;
        if (DayOfWeekStr === ReservationInfo.WeekDay) { count = reservationNum; }
        else if (isNaN(reservationNum) || reservationNum <= 0) { count = 1; }
        else { count = reservationNum + 1; }

        const userDocSnap = await getDoc(userDocRef, { source: 'cache' });
        if (userDocSnap.exists()) {
            await updateDoc(userDocRef, {
                ReservationNum: count
            });
        } else {
            await setDoc(userDocRef, {
                ReservationNum: count
            });
        }

        // Post reservation to Firestore
        await setDoc(postDocRef, {
            PostUserMail: auth.currentUser.email,
            WeekDay: ReservationInfo.WeekDay,
            TimeSlot: ReservationInfo.TimeSlot,
            PersonalName: personalname,
            Category: category,
            Memo: memo,
            NickName: nickname
        });

        // Prepare reservation data as text for storage
        const reservationText = `
            Reservation Details:
            - User Email: ${auth.currentUser.email}
            - WeekDay: ${ReservationInfo.WeekDay}
            - TimeSlot: ${ReservationInfo.TimeSlot}
            - Name: ${personalname}
            - Category: ${category}
            - Memo: ${memo}
            - NickName: ${nickname}
        `;

        // Create a reference to the text file in Firebase Storage
        const storageRef = ref(storage, `reservations/${WeekDay}_${TimeSlot}_${personalname}.txt`);

        // Upload the text content to Firebase Storage
        await uploadString(storageRef, reservationText)
            .then(() => {
                console.log("Reservation saved to Firebase Storage as text.");
            })
            .catch((error) => {
                console.error("Error saving reservation to Storage:", error);
            });

        setIsAlreadyUploaded(true);
    };

    return (
        <>
            <Header />

            {!isloaded ?
                <>
                    {[...Array(8)].map((a, i) => <br key={i} />)}
                    <div class="loader">Loading...</div>
                </>
                :
                <>
                    <center>
                        <div class="kame_header_003"><p class="kame_font_003">{ReservationInfo.WeekDay}曜日</p></div>
                        <p class="kame_font_003">{ReservationInfo.TimeSlot}({ReservationInfo.Time})</p>
                        <form>
                            <label class="kame_select_005">
                                <select onChange={handleSelectChange1}>
                                    <option value="バンド"><p class="kame_font_002"></p>バンド</option>
                                    <option value="個人">個人</option>
                                    <option value="パート">パート</option>
                                    <option value="その他">その他</option>
                                </select>
                            </label>
                        </form>
                        <br /><br />
                        {!category && <p class="kame_font_error">※練習内容を選択してください</p>}
                        <label>
                            <textarea class="kame_textarea" onChange={handleSelectChange3} placeholder="(例) ずっと真夜中でいいのに。" minLength={"0"} maxLength={"20"} value={memo} />
                        </label>
                        <br /><br /><br />

                        {canReserve && !isalreadyuploaded && !isclicked &&
                            <button to="/" class="kame_button_light_blue" onClick={PostButtonClick}><p class="kame_font_002">予約</p></button>
                        }
                        {!canReserve && // 追加: 予約上限に達していない場合にエラーメッセージを表示
                            <p class="kame_font_002">予約は週に2回までです</p>
                        }
                        {isAlreadyExisted && // 追加: 予約上限に達した場合のエラーメッセージ
                            <p class="kame_font_002">既に予約されました</p>
                        }
                        {
                            isclicked && !isalreadyuploaded &&
                            <div class="loader">Loading...</div>

                        }
                        {isloaded && isalreadyuploaded &&
                            <Link to="/reservation" class="kame_button_light_blue"><p class="kame_font_002">完了</p></Link>
                        }
                    </center>
                </>
            }
            <Footer />
        </>

    )
}

export default AddReservation;
