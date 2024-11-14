import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

function KeyAccess() {
    const [user, loading, error] = useAuthState(auth); // 認証状態をフックで取得
    const navigate = useNavigate();

    useEffect(() => {
        const handleAccess = async () => {
            if (loading) return; // 読み込み中は何もしない
            if (error) {
                console.error("Error with auth state:", error);
                return;
            }
            if (!user) {
                // 認証されていない場合、ログインにリダイレクト
                navigate('/login');
                return;
            }

            // usersコレクションから追加情報を取得
            const userDocRef = doc(db, 'users', user.email);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
                console.error("User document does not exist");
                return;
            }
            const userData = userDocSnap.data();
            const personalName = userData.PersonalName || "";
            const nickName = userData.NickName || "";

            // 鍵のデータ操作
            const keyDocRef = doc(db, 'Key', 'Holder');
            const keyDocSnap = await getDoc(keyDocRef, { source: 'cache' });

            if (keyDocSnap.exists()) {
                const keyData = keyDocSnap.data();

                if (keyData.email === user.email) {
                    // ユーザーが鍵を借りているユーザーと同じ場合、返却処理を実行
                    await updateDoc(keyDocRef, {
                        email: null,
                        image: null,
                        name: null,
                        nickname: nickName,
                        time: new Date().toLocaleString()
                    });
                } else {
                    // 違う場合、現在のユーザーで上書きして借用を行う
                    await updateDoc(keyDocRef, {
                        email: user.email,
                        image: user.photoURL,
                        name: personalName,
                        nickname: nickName,
                        time: new Date().toLocaleString()
                    });
                }
            } else {
                // ドキュメントが存在しない場合、新しいデータで作成
                await setDoc(keyDocRef, {
                    email: user.email,
                    image: user.photoURL,
                    name: personalName,
                    nickname: nickName,
                    time: new Date().toLocaleString()
                });
            }

            // 処理完了後、/keyにリダイレクト
            navigate('/key');
        };

        handleAccess();
    }, [user, loading, error, navigate]);

    return (
        <div className="loader">処理中です...</div>
    );
}

export default KeyAccess;
