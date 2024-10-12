import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';  // Firebase設定ファイル
import './CreateReservationSettings.css';  // カスタムCSSをインポート

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
const timeSlots = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];

function CreateReservationSettings() {
    const [selectedSlots, setSelectedSlots] = useState({});  // 選択されたスロットを管理
    const [templates, setTemplates] = useState([]);  // テンプレートのリスト
    const [selectedTemplate, setSelectedTemplate] = useState('');  // 選択されたテンプレートID

    // Firestoreからテンプレートリストを取得
    useEffect(() => {
        const fetchTemplates = async () => {
            const templatesSnapshot = await getDocs(collection(db, 'ReservationTemplate'));
            const templatesList = templatesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTemplates(templatesList);
        };

        fetchTemplates();
    }, []);

    // セルがクリックされたときに選択状態をトグルする処理
    const handleCellClick = (day, timeSlot) => {
        const key = `${day}_${timeSlot}`;
        setSelectedSlots((prevState) => ({
            ...prevState,
            [key]: !prevState[key]  // 選択状態をトグルする
        }));
    };

    // Firestoreに予約設定データを保存する処理
    const handleSaveSettings = async () => {
        if (!selectedTemplate) {
            alert('テンプレートを選択してください。');
            return;
        }

        const settingsData = {};

        // 選択されたスロットをFirestoreに保存する形式に変換
        Object.keys(selectedSlots).forEach((key) => {
            if (selectedSlots[key]) {
                const [day, timeSlot] = key.split('_');
                if (!settingsData[day]) {
                    settingsData[day] = [];
                }
                settingsData[day].push(timeSlot);
            }
        });

        // Firestoreに予約設定を保存
        await Promise.all(Object.keys(settingsData).map(async (day) => {
            const docRef = doc(db, 'ReservationSchedules', day);  // 'ReservationSchedules' コレクション

            // 既存のデータを取得
            const existingDoc = await getDoc(docRef);

            // 新しい予約データを作成
            const newReservation = {
                TemplateID: selectedTemplate,
                TimeSlots: settingsData[day],
            };

            if (existingDoc.exists()) {
                const existingData = existingDoc.data();

                // 既存のデータを保持しつつ、同じテンプレートIDの予約は上書き、他のテンプレートIDのデータは保持
                const updatedReservations = existingData.Reservations || [];

                const updatedData = updatedReservations.filter(
                    (res) => res.TemplateID !== selectedTemplate
                );

                updatedData.push(newReservation);

                await setDoc(docRef, {
                    Reservations: updatedData
                }, { merge: true });  // 既存のデータを保持しつつ、新しいデータを追加
            } else {
                // 既存データがない場合は新規作成
                await setDoc(docRef, {
                    Reservations: [newReservation]
                });
            }
        }));

        alert("予約設定が保存されました！");
    };

    return (
        <div className="container">
            <h2>予約設定とメッセージテンプレートの選択</h2>

            {/* テンプレートの選択 */}
            <div className="template-selection">
                <label>テンプレートを選択:
                    <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                        <option value="">-- テンプレートを選択 --</option>
                        {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                                {template.Category} - {template.NickName}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="table-container">
                <h3>Reservation Settings</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Time Slot</th>
                            {weekDays.map((day) => (
                                <th key={day}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((timeSlot) => (
                            <tr key={timeSlot}>
                                <td>{timeSlot}</td>
                                {weekDays.map((day) => {
                                    const key = `${day}_${timeSlot}`;
                                    return (
                                        <td
                                            key={key}
                                            onClick={() => handleCellClick(day, timeSlot)}
                                            className={selectedSlots[key] ? 'selected' : 'unselected'}  // 選択状態に応じてクラスを付与
                                        >
                                            {selectedSlots[key] ? '★' : '○'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="text-center">
                    <button onClick={handleSaveSettings}>Save Reservation Settings</button>
                </div>
            </div>
        </div>
    );
}

export default CreateReservationSettings;
