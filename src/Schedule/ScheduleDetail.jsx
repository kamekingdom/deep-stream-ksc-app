import React, { useContext, useEffect, useState } from 'react';
import { Footer, Header } from '../PageParts';
import { InfoContext, ScheduleContext, useBlockBrowserBack } from '../App';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ScheduleDetail.css'; // このページ専用のCSS
import { signInWithEmailAndPassword } from 'firebase/auth';
import '../css/kame.css';
import '../css/kame_login.css';

const ScheduleDetail = () => {
    const [user] = useAuthState(auth);
    const [startDate] = useState(new Date()); // 開始日は今日を固定
    const [endDate, setEndDate] = useState(null);
    const [schedule, setSchedule] = useState({});
    const [profile, setProfile] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [isEndDateLocked, setIsEndDateLocked] = useState(false);
    const firestore = getFirestore();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const endDateParam = params.get('endDate');
        if (endDateParam) {
            const parsedEndDate = new Date(endDateParam);
            if (!isNaN(parsedEndDate)) {
                setEndDate(parsedEndDate);
                setIsEndDateLocked(true);
            }
        }
    }, []);

    useEffect(() => {
        const fetchProfileAndSchedule = async () => {
            if (user) {
                const userDocRef = doc(firestore, 'users', auth.currentUser.email);
                const scheduleDocRef = doc(firestore, 'schedules', auth.currentUser.email);

                try {
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setProfile(userDoc.data());
                    }

                    const scheduleDoc = await getDoc(scheduleDocRef);
                    if (scheduleDoc.exists()) {
                        setSchedule(scheduleDoc.data().schedule || {});
                    }
                } catch (error) {
                    console.error('データ取得エラー：', error);
                }
            }
        };

        fetchProfileAndSchedule();
    }, [user, firestore]);

    useEffect(() => {
        const dateRange = generateDateRange();
        if (dateRange.length > 0) {
            const allDatesFilled = dateRange.every((date) => schedule[date]);
            setIsComplete(allDatesFilled);
        }
    }, [schedule, endDate]);

    const generateDateRange = () => {
        if (!endDate) return [];
        const dates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };

    const updateStatus = (date, status) => {
        setSchedule((prev) => ({
            ...prev,
            [date]: status,
        }));
    };

    const saveSchedule = async () => {
        try {
            const dataToSave = {
                schedule,
                PersonalName: profile?.PersonalName || '',
                NickName: profile?.NickName || '',
            };

            await setDoc(doc(firestore, 'schedules', auth.currentUser.email), dataToSave);
            alert('スケジュールが保存されました！');
        } catch (error) {
            console.error('保存エラー：', error);
            alert('スケジュールの保存に失敗しました．');
        }
    };

    return (
        <div className="schedule-detail-container">
            <h2 className="schedule-detail-title">日程調整</h2>
            {user ? (
                profile ? (
                    <div>
                        <div className="schedule-detail-date-picker">
                            <div className="date-picker-group">
                                <DatePicker
                                    selected={startDate}
                                    disabled
                                    className="custom-date-picker"
                                />
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    placeholderText="終了日を選択"
                                    className="custom-date-picker"
                                    disabled={isEndDateLocked}
                                />
                            </div>
                        </div>

                        {generateDateRange().length > 0 && (
                            <ul className="schedule-detail-list">
                                {generateDateRange().map((date) => (
                                    <li key={date} className="schedule-detail-item">
                                        <span className="schedule-detail-date">{date}</span>
                                        <div className="schedule-detail-buttons">
                                            <button
                                                onClick={() => updateStatus(date, '〇')}
                                                className={
                                                    schedule[date] === '〇'
                                                        ? 'custom-button selected-green'
                                                        : 'custom-button'
                                                }
                                            >
                                                〇
                                            </button>
                                            <button
                                                onClick={() => updateStatus(date, '△')}
                                                className={
                                                    schedule[date] === '△'
                                                        ? 'custom-button selected-yellow'
                                                        : 'custom-button'
                                                }
                                            >
                                                △
                                            </button>
                                            <button
                                                onClick={() => updateStatus(date, '✕')}
                                                className={
                                                    schedule[date] === '✕'
                                                        ? 'custom-button selected-red'
                                                        : 'custom-button'
                                                }
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="schedule-detail-save">
                            <button
                                onClick={saveSchedule}
                                className="save-button"
                                disabled={!isComplete}
                            >
                                保存する
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="loader">Loading...</div>
                )
            ) : (
                <LoginForm />
            )}
            <Footer />
        </div>
    );
};

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const loginWithEmail = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setError('ログインに失敗しました');
        }
    };

    return (
        <div className="login-page">
            <div className="form">
                <center>
                    <h2 className="kame_font_002">ログイン</h2><br />
                    <form onSubmit={loginWithEmail} className="kame_login_form">
                        <input
                            type="email"
                            placeholder="メールアドレス"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="kame_input"
                        />
                        <input
                            type="password"
                            placeholder="パスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="kame_input"
                        />
                        <br /><br />
                        <button type="submit" className="kame_button_light_blue">
                            <p className="kame_font_001">ログイン</p>
                        </button>
                    </form>
                    {error && <p className="kame_font_001 kame_error_message">{error}</p>}
                </center>
            </div>
        </div>
    );
}

export default ScheduleDetail;
