import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';  // Firebase設定ファイル

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
const incorrectTimeSlots = ["1限", "2限", "3限", "4限", "5限"];
const correctTimeSlots = ["１限", "２限", "３限", "４限", "５限"];

function FixTimeSlotsPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // タイムスロットの修正を実行する非同期関数
    const fixTimeSlots = async () => {
        setLoading(true);
        try {
            // 各曜日に対して処理
            for (const day of weekDays) {
                const dayCollection = collection(db, day);  // Firestoreの曜日コレクション
                const daySnapshot = await getDocs(dayCollection);

                // 各タイムスロットに対してチェック
                for (const docSnapshot of daySnapshot.docs) {
                    const timeSlot = docSnapshot.id;

                    // 間違ったタイムスロットが存在する場合
                    const index = incorrectTimeSlots.indexOf(timeSlot);
                    if (index !== -1) {
                        const correctTimeSlot = correctTimeSlots[index];  // 正しいタイムスロット名を取得

                        // 正しいタイムスロットで新しいドキュメントを作成
                        const correctDocRef = doc(db, day, correctTimeSlot);
                        await setDoc(correctDocRef, docSnapshot.data());

                        // 古いドキュメント（間違ったタイムスロット）を削除
                        const incorrectDocRef = doc(db, day, timeSlot);
                        await deleteDoc(incorrectDocRef);

                        console.log(`タイムスロット ${timeSlot} が ${correctTimeSlot} に修正されました。`);
                    }
                }
            }

            setMessage('全てのタイムスロットの修正が完了しました。');
        } catch (error) {
            console.error('タイムスロットの修正中にエラーが発生しました: ', error);
            setMessage('エラーが発生しました。詳細をコンソールで確認してください。');
        }
        setLoading(false);
    };

    // ページロード時に修正処理を実行
    useEffect(() => {
        fixTimeSlots();
    }, []);

    return (
        <div className="container">
            <h2>タイムスロット修正</h2>
            {loading ? (
                <p>修正中...</p>
            ) : (
                <p>{message}</p>
            )}
        </div>
    );
}

export default FixTimeSlotsPage;
