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
            <h1 className='font-bold mb-20 text-6xl'>パスワードを忘れた場合</h1>
            <input
                className="my-2 p-5 text-2xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                type="email"
                placeholder="メールアドレスを入力"
                onChange={(e) => setEmail(e.target.value)}
            />
            <button className="mt-20 my-2 text-2xl border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 p-4" onClick={sendResetEmail}>送信</button>
        </div>
    );
}
