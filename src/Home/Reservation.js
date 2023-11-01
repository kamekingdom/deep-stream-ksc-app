import React, { useContext, useEffect, useState } from 'react'
import { Footer, Header } from '../PageParts'
import { Link } from 'react-router-dom'
import { ReservationContext } from '../App';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import "../css/kame.css";

function Reservation() {
    const linkStyle = { color: "#e4e4e4", background: "white", fontSize: "2.3em" };
    const starStyle = { color: "#acacac", background: "white", fontSize: "1.9em" };

    const [loading, setLoading] = useState(true);
    const ReservationInfo = useContext(ReservationContext);

    const TimeSlotList = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];
    const TimeList = ["8:00 ~ 8:50", "9:00 ~ 10:40", "10:40 ~ 11:10", "11:10 ~ 12:50", "12:50 ~ 13:30", "13:30 ~ 15:10", "15:20 ~ 17:00", "17:05 ~ 18:45", "18:50 ~ 19:50", "20:00 ~ 21:00"];
    const WeekDayList = ["　　　　", "日", "月", "火", "水", "木", "金", "土"];
    const DAYOFWEEKSTR = ["日", "月", "火", "水", "木", "金", "土"];

    var date = new Date();
    var dayOfWeek = date.getDay();
    var DayOfWeekStr = DAYOFWEEKSTR[dayOfWeek];
    const [reserve, setReserve] = useState(null);
    const DayOfWeekStrIndex = DAYOFWEEKSTR.indexOf(DayOfWeekStr);
    const IsAvailableReservationDay = [];

    const [reservationNum, setReservationNum] = useState("");

    for (let i = 0; i < DAYOFWEEKSTR.length; i++) {
        if (i <= DayOfWeekStrIndex - 1) {
            IsAvailableReservationDay.push(false);
        } else {
            IsAvailableReservationDay.push(true);
        }
    }
    useEffect(() => {
        async function findFirestoreData() {
            try {
                const newData = await Promise.all(
                    WeekDayList.map(async (weekday) => {
                        return Promise.all(
                            TimeSlotList.map(async (slot) => {
                                const docRef = doc(db, weekday, slot);
                                const docSnap = await getDoc(docRef);
                                if (docSnap.exists()) {
                                    const docData = docSnap.data();
                                    setReservationNum(docData.ReservationNum)
                                    return docData.PostUserMail;
                                } else {
                                    return false;
                                }
                            })
                        );
                    })
                );
                setReserve(newData);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        }
        findFirestoreData();
    }, []);

    function setReservationInfo(weekday, timeslot, time) {
        ReservationInfo.WeekDay = weekday;
        ReservationInfo.TimeSlot = timeslot;
        ReservationInfo.Time = time;
    }


    if (loading) {
        return (
            <>
                <Header />
                {[...Array(8)].map((a, i) => <br key={i} />)}
                <div class="loader">Loading...</div>
                <Footer />
            </>
        )
    }
    return (
        <>
            <Header />

            <table border="0" class="kame_table_003">
                <th>&emsp;&emsp;&emsp;&emsp;</th>{/* 左上 */}
                {DAYOFWEEKSTR.map((weekday, index) =>
                    IsAvailableReservationDay[index] ?
                        <th style={{ color: weekday === "土" ? "blue" : weekday === "日" ? "red" : "black" }}>{weekday}</th> :
                        <th style={{ color: weekday === "土" ? "#87cefa" : weekday === "日" ? "#ffc0cb" : "#c0c0c0" }}>{weekday}</th>
                )}
                {TimeSlotList.map((timeslot, index) =>
                    <tr>
                        <td>{timeslot}</td>
                        {DAYOFWEEKSTR.map((weekday, num) => (
                            <td key={num} style={{ padding: 0 }}>
                                {IsAvailableReservationDay[num] && (
                                    reserve[num + 1][index] === auth.currentUser.email ? (
                                        <Link to="/reservationdetail" onClick={() => setReservationInfo(weekday, timeslot, TimeList[index])} style={starStyle}>★</Link>
                                    ) : (
                                        reserve[num + 1][index] ? 
                                        <Link to="/reservationdetail" onClick={() => setReservationInfo(weekday, timeslot, TimeList[index])} style={linkStyle}>×</Link>
                                        :
                                        <Link to="/addreservation" onClick={() => setReservationInfo(weekday, timeslot, TimeList[index])} style={linkStyle}>o</Link>
                                    ))
                                }
                                {!IsAvailableReservationDay[num] && (
                                    reserve[num + 1][index] === auth.currentUser.email ? (
                                        <Link to="/alertreservation" onClick={() => setReservationInfo(weekday, timeslot, TimeList[index])} style={starStyle}>★</Link>
                                    ) : (
                                        < Link to="/alertreservation" onClick={() => setReservationInfo(weekday, timeslot, TimeList[index])} style={linkStyle}>×</Link>
                                    ))
                                }
                            </td>
                        ))}


                    </tr>
                )}
            </table >
            <a href="http://deepstream.boo.jp/kame_kingdom/DeepStreamApplication/Documents/2023部室利用規約.pdf"><p style={{ fontSize: "1.7em", color: "green" }}>部室の利用規約</p></a>
            <Footer />
        </>
    )
}

export default Reservation