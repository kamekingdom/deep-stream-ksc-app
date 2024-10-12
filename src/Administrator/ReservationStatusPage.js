import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';  // Firebase設定ファイル
import "./CreateReservationSettings.css";

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
const timeSlots = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];

function ReservationStatusPage() {
    const [reservationData, setReservationData] = useState({});
    const [loading, setLoading] = useState(true);

    // Firestoreから予約状況を取得
    useEffect(() => {
        const fetchReservationData = async () => {
            setLoading(true);
            const allReservations = {};

            // 各曜日ごとにデータを取得
            for (const day of weekDays) {
                const dayCollection = collection(db, day); // Firestoreの曜日ごとのコレクション
                const daySnapshot = await getDocs(dayCollection);

                // 各タイムスロットのデータを取得して保存
                const reservationsForDay = {};
                daySnapshot.docs.forEach(doc => {
                    reservationsForDay[doc.id] = doc.data();  // タイムスロット名をキーに予約の詳細データを保存
                });

                allReservations[day] = reservationsForDay;
            }

            setReservationData(allReservations);
            setLoading(false);
        };

        fetchReservationData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <h2>予約状況</h2>

            {/* 表形式で予約状況を表示 */}
            <table className="min-w-full bg-white border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border">Time Slot</th>
                        {weekDays.map((day) => (
                            <th key={day} className="py-2 px-4 border">{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {timeSlots.map((timeSlot) => (
                        <tr key={timeSlot}>
                            <td className="py-2 px-4 border">{timeSlot}</td>
                            {weekDays.map((day) => {
                                const reservation = reservationData[day]?.[timeSlot];  // 特定の曜日の特定のタイムスロットの予約データ

                                return (
                                    <td key={day} className="py-2 px-4 border">
                                        {reservation ? (
                                            <div>
                                                <p><strong>{reservation.NickName}</strong></p>
                                                <p>{reservation.Category}</p>
                                                <p>{reservation.PersonalName}</p>
                                            </div>
                                        ) : (
                                            '空き'
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ReservationStatusPage;