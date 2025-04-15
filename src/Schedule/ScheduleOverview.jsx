import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { Header, Footer } from '../PageParts';
import './ScheduleOverview.css'; // スタイル用

const ScheduleOverview = () => {
    const [users, setUsers] = useState([]); // 全メンバー
    const [filteredUsers, setFilteredUsers] = useState([]); // 検索結果に基づくメンバー
    const [selectedUsers, setSelectedUsers] = useState([]); // 選択されたメンバー
    const [searchQuery, setSearchQuery] = useState(''); // 検索クエリ
    const [scheduleData, setScheduleData] = useState({}); // スケジュールデータ
    const [dateRange, setDateRange] = useState([]); // 日程範囲

    const firestore = getFirestore();

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnapshot = await getDocs(collection(firestore, 'schedules'));
            const usersList = usersSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(usersList);
        };

        fetchUsers();
    }, [firestore]);

    useEffect(() => {
        const fetchSchedules = async () => {
            const schedules = {};
            for (const user of selectedUsers) {
                const scheduleDoc = await getDoc(doc(firestore, 'schedules', user));
                if (scheduleDoc.exists()) {
                    schedules[user] = scheduleDoc.data().schedule || {};
                }
            }
            setScheduleData(schedules);

            // 日程範囲を生成（最初のユーザーのスケジュールに基づく）
            const firstUserSchedule = Object.keys(schedules[selectedUsers[0]] || {});
            setDateRange(firstUserSchedule.sort());
        };

        if (selectedUsers.length > 0) {
            fetchSchedules();
        }
    }, [selectedUsers, firestore]);

    const countResponses = (date, responseType) => {
        let count = 0;
        for (const user of selectedUsers) {
            if (scheduleData[user] && scheduleData[user][date] === responseType) {
                count++;
            }
        }
        return count;
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setFilteredUsers(
            users.filter(
                (user) =>
                    (user.NickName || '').toLowerCase().includes(query.toLowerCase()) ||
                    (user.Name || '').toLowerCase().includes(query.toLowerCase()) ||
                    (user.Name || '').toLowerCase().includes(query.toLowerCase()) ||
                    user.id.toLowerCase().includes(query.toLowerCase())
            )
        );
    };

    return (
        <div className="schedule-overview-container">
            <Header />
            <h2 className="schedule-overview-title">日程調整</h2>

            {/* メンバー検索 */}
            <div className="member-search">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="🔍 メンバーを検索..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* 選択中のメンバーを表示 */}
            {selectedUsers.length > 0 && (
                <div className="selected-members">
                    <h3>選択中のメンバー:</h3>
                    <ul className="selected-members-list">
                        {selectedUsers.map((userId) => {
                            const user = users.find((u) => u.id === userId);
                            return (
                                <li key={userId}>
                                    {user
                                        ? `${user.Name || '名前不明'}（${user.NickName || 'ニックネーム不明'}）`
                                        : userId}
                                    <button
                                        className="remove-member-button"
                                        onClick={() =>
                                            setSelectedUsers((prev) => prev.filter((id) => id !== userId))
                                        }
                                    >
                                        ✖
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* フィルタリングされたメンバー選択 */}
            {searchQuery && filteredUsers.length > 0 && (
                <div className="member-selection">
                    <h3>メンバーを選択してください：</h3>
                    <ul className="member-list">
                        {filteredUsers.map((user) => (
                            <li key={user.id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value={user.id}
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={(e) => {
                                            const { value, checked } = e.target;
                                            setSelectedUsers((prev) =>
                                                checked ? [...prev, value] : prev.filter((id) => id !== value)
                                            );
                                        }}
                                    />
                                    {user.Name || '名前不明'}（{user.NickName || 'ニックネーム不明'}）
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 日程表示 */}
            {dateRange.length > 0 && (
                <div className="schedule-table">
                    <table>
                        <thead>
                            <tr>
                                <th>日付</th>
                                <th>〇</th>
                                <th>△</th>
                                <th>✕</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dateRange.map((date) => {
                                const totalResponses = selectedUsers.length;
                                const xCount = countResponses(date, '✕');
                                const xPercentage = totalResponses > 0 ? (xCount / totalResponses) * 100 : 0;

                                // 行のスタイルを設定
                                const rowStyle =
                                    xCount === 0
                                        ? { backgroundColor: '#d4edda' } // 緑系の薄い背景色
                                        : xPercentage <= 25
                                            ? { backgroundColor: '#fff3cd' } // 黄色系の薄い背景色
                                            : {};

                                return (
                                    <tr key={date} style={rowStyle}>
                                        <td>{date}</td>
                                        <td>{countResponses(date, '〇')}</td>
                                        <td>{countResponses(date, '△')}</td>
                                        <td>{xCount}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Footer />
        </div>

    );
};

export default ScheduleOverview;
