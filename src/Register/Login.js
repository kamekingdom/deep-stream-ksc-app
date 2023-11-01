import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import "../css/kame.css";
import "../css/kame_login.css";
import { Link } from "react-router-dom";
import { auth } from '../firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import { Footer, Header } from '../PageParts';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

function Login() {
    const [user] = useAuthState(auth);
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <Helmet><title>ログイン</title></Helmet>
            <Header /><br /><br />
            <div class="login-page">
                <div class="form">
                    <center>
                        {user ?
                            <>
                                <p class="kame_font_002">アカウント</p>
                                <Link class="kame_button_light_blue" to="/userprofile"><p className='kame_font_001'>登録情報</p></Link>
                                <br />
                                <Link to="/" className='kame_button_light_blue'><p className='kame_font_001'>ホーム</p></Link>
                                <br />
                                <button onClick={handleLogout} className='kame_button_light_blue'><p className='kame_font_001'>ログアウト</p></button>
                            </>
                            :
                            <>
                                <p class="kame_font_002">ログイン</p>
                                <EmailLogin />
                                <br />
                                <p class="message">未登録の方は<Link to="/register">会員登録</Link></p>
                                <p class="message">利用規約は<Link to="/termsofservice">こちら</Link></p>
                            </>
                        }
                    </center>
                </div>
            </div>
        </div>
    )
}

function EmailLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const loginWithEmail = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setError(translateFirebaseError(error.code));
        }
    };

    return (
        <div>
            <form onSubmit={loginWithEmail}>
                <input
                    type="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /><br /><br />
                {email && password &&
                    <button type="submit"><p className='kame_font_001'>ログイン</p></button>
                }
            </form>
            {error && <p className="kame_font_001">{error}</p>}
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

export default Login;