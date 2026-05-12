import React, { useEffect, useState } from 'react';
import { Footer, Header } from '../PageParts';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import "../css/kame.css";

function ReservationPreview() {
    const [reservationsMatrix, setReservationsMatrix] = useState({});
    const [loading, setLoading] = useState(true);

    const TimeSlotList = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];
    const WeekDayList = ["日", "月", "火", "水", "木", "金", "土"];

    async function fetchReservationFiles() {
        try {
            const nextMatrix = {};

            await Promise.all(
                WeekDayList.map(async (day) => {
                    nextMatrix[day] = {};

                    await Promise.all(
                        TimeSlotList.map(async (slot) => {
                            const docSnap = await getDoc(doc(db, day, slot));
                            nextMatrix[day][slot] = docSnap.exists() ? docSnap.data() : null;
                        })
                    );
                })
            );

            setReservationsMatrix(nextMatrix);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching reservation data:", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReservationFiles();
    }, []);

    // Loading screen
    if (loading) {
        return (
            <>
                <Header />
                <div className="loader">Loading...</div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="reservation-preview-container">
                <h2>Reservation Previews</h2>
                <table className="kame_table_003">
                    <thead>
                        <tr>
                            <th>&nbsp;</th>
                            {WeekDayList.map((day, index) => (
                                <th key={index} style={{ color: day === "土" ? "blue" : day === "日" ? "red" : "black" }}>
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TimeSlotList.map((slot, index) => (
                            <tr key={index}>
                                <td>{slot}</td>
                                {WeekDayList.map((day, num) => (
                                    <td key={num} style={{ textAlign: 'center', padding: '10px' }}>
                                        {reservationsMatrix[day][slot] ? (
                                            <span style={{ color: "#007bff" }}>
                                                {reservationsMatrix[day][slot].PersonalName}
                                            </span>
                                        ) : (
                                            <span style={{ background: "none", color: "#ccc" }}>〇</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Footer />
        </>
    );
}

export default ReservationPreview;
