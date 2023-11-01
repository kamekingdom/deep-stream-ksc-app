import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import "../css/kame.css";
import { Header } from '../PageParts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, query, collection, where, getDocs, addDoc } from 'firebase/firestore';

function Register() {
    const [user] = useAuthState(auth);

    return (
        <div>
            <Helmet><title>会員登録</title></Helmet>
            <Header /><br /><br />
            <div class="login-page">
                <div class="form">
                    <center>
                        {user ?
                            <>
                                <p class="kame_font_002">会員登録</p>
                                <EmailRegister />
                                <br />
                                <p class="message">アカウントをお持ちの方は<Link to="/login">ログイン</Link></p>
                                <p class="message">利用規約は<Link to="/termsofservice">こちら</Link></p><br />

                            </>
                            :
                            <>
                                <p class="kame_font_002">会員登録</p>
                                <EmailRegister />
                                <br />
                                <p class="message">アカウントをお持ちの方は<Link to="/login">ログイン</Link></p>
                                <p class="message">利用規約は<Link to="/termsofservice">こちら</Link></p>
                            </>
                        }
                    </center>
                </div>
            </div>
        </div>
    )
}

function EmailRegister() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [personalName, setPersonalName] = useState('');
    const [personalNameKana, setPersonalNameKana] = useState('');
    const [nickname, setNickname] = useState('');
    const [studentNumber, setStudentNumber] = useState('');
    const [error, setError] = useState("");
    const [isalreadyuploaded, setIsAlreadyUploaded] = useState(false);
    const [isclicked, setIsClicked] = useState(false)
    const firestore = getFirestore();

    // Check if a student number already exists
    const isStudentNumberExists = async (studentNumber) => {
        const studentNumberRef = await query(collection(firestore, 'users'), where('StudentNumber', '==', studentNumber));
        const studentNumberSnapshot = await getDocs(studentNumberRef);
        return !studentNumberSnapshot.empty;
    };

    // Check if a nickname already exists
    const isNicknameExists = async (nickname) => {
        const nicknameRef = await query(collection(firestore, 'users'), where('NickName', '==', nickname));
        const nicknameSnapshot = await getDocs(nicknameRef);
        return !nicknameSnapshot.empty;
    };

    // Validate if a string consists of katakana and spaces only
    const validateKatakana = (str) => {
        return /^[\u30A0-\u30FF\s]+$/.test(str);
    };

    const resetForm = () => {
        setError('');
        setIsClicked(false);
        setIsAlreadyUploaded(false);
    };

    const validateStudentNumber = (str) => {
        return /^\d{8}$/.test(str);
    };

    const registerWithEmail = async (e) => {
        setIsAlreadyUploaded(false);
        setIsClicked(true);
        e.preventDefault();
        setError(null);
        if (!validateKatakana(personalNameKana)) {
            setError('氏名(カタカナ)はカタカナで入力してください🐢');
            return;
        }
        if (!validateStudentNumber(studentNumber)) {
            setError('学籍番号は8桁の半角数字で入力してください🐢');
            return;
        }
        if (await isStudentNumberExists(studentNumber)) {
            setError('この学籍番号は既に登録されています🐢');
            return;
        }
        if (await isNicknameExists(nickname)) {
            setError('このニックネームは既に登録されています🐢');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            const userDocRef = doc(firestore, 'users', email);
            await setDoc(userDocRef, {
                PersonalName: personalName,
                PersonalNameFurigana: personalNameKana,
                StudentNumber: studentNumber,
                NickName: nickname,
                Password: password,
                userId: userId,
                ReservationNum: 0
            });
            console.log("会員登録成功");
            setIsAlreadyUploaded(true);
        } catch (error) {
            console.log("会員登録失敗");
            setError(translateFirebaseError(error.code));
        }
        setIsClicked(false);
    };

    return (
        <div>
            <form onSubmit={registerWithEmail}>
                <input
                    type="email"
                    placeholder="メールアドレス(関学用)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                < input
                    type="text"
                    placeholder="氏名(漢字)"
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="氏名(カタカナ)"
                    value={personalNameKana}
                    onChange={(e) => setPersonalNameKana(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="ニックネーム"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="学籍番号"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                /><br /><br />
                {email && password && personalName && personalNameKana && nickname && studentNumber && !isalreadyuploaded && !isclicked && !error &&
                    <button type="submit"><p className='kame_font_001'>登録</p></button>
                }
                {
                    !error && isclicked && !isalreadyuploaded && <div class="loader">Loading...</div>
                }
                {isalreadyuploaded &&
                    <>
                        <Link to="/" className='kame_button_light_blue'><p className='kame_font_001'>ホーム</p></Link>
                    </>
                }
            </form>
            {error &&
                <>
                    <p className="kame_font_001">{error}</p>
                    <button className='kame_button_light_blue' onClick={resetForm}><p className='kame_font_001'>修正する</p></button>
                </>
            }
        </div>
    );
}

function translateFirebaseError(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'このメールアドレスは既に使用されています🐢',
        'auth/invalid-email': 'メールアドレスが無効です🐢',
        'auth/operation-not-allowed': 'メール/パスワード認証が無効です🐢',
        'auth/weak-password': 'パスワードが弱すぎます🐢',
        'auth/user-disabled': 'このアカウントは無効です🐢',
        'auth/user-not-found': 'ユーザーが見つかりません🐢',
        'auth/wrong-password': 'パスワードが間違っています🐢',
        // 他のエラーコードに対するメッセージもここに追加できます
    };

    return errorMessages[errorCode] || '予期しないエラーが発生しました🐢';
}

export default Register;
