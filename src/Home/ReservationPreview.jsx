import React, { useEffect, useState } from 'react';
import { Footer, Header } from '../PageParts';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import "../css/kame.css";

function ReservationPreview() {
    const [reservationFiles, setReservationFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const TimeSlotList = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];
    const WeekDayList = ["日", "月", "火", "水", "木", "金", "土"];

    // Fetch all reservation files from Firebase Storage
    async function fetchReservationFiles() {
        const storage = getStorage();
        const storageRef = ref(storage, 'reservations');

        try {
            const result = await listAll(storageRef);
            const files = result.items;

            // Get download URLs and extract data for display
            const filePreviews = await Promise.all(
                files.map(async (fileRef) => {
                    const url = await getDownloadURL(fileRef);
                    const fileName = fileRef.name.replace('.txt', '');
                    const [weekDay, timeSlot, personalName] = fileName.split('_');
                    return { weekDay, timeSlot, personalName, url };
                })
            );

            setReservationFiles(filePreviews);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching reservation files:", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReservationFiles();
    }, []);

    // Map reservations to a 2D matrix
    const reservationsMatrix = WeekDayList.reduce((matrix, day) => {
        matrix[day] = {};
        TimeSlotList.forEach(slot => {
            const file = reservationFiles.find(f => f.weekDay === day && f.timeSlot === slot);
            matrix[day][slot] = file || null;
        });
        return matrix;
    }, {});

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
                                            <button
                                                onClick={() => window.open(reservationsMatrix[day][slot].url)}
                                                style={{ color: "#007bff", cursor: "pointer", background: "none", border: "none" }}
                                            >
                                                {reservationsMatrix[day][slot].personalName}
                                            </button>
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
