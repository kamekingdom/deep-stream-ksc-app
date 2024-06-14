import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function FindPassword() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const sendResetEmail = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            alert('パスワードリセットメールを送信しました。メールを確認してください。');
            navigate('/login'); 
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className='font-bold mb-15'>パスワードを忘れた場合</h1>
            <input
                className="my-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                type="email"
                placeholder="メールアドレスを入力してください"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button className="my-2" onClick={sendResetEmail}>送信</button>
        </div>
    );
}
