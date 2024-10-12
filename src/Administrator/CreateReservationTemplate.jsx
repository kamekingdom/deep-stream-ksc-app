import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';  // Firebase設定ファイル
import './CreateReservationSettings.css';  // カスタムCSS

function CreateReservationTemplate() {
    const [template, setTemplate] = useState({
        Category: '',
        Memo: '',
        NickName: '',
        PersonalName: '',
        PostUserMail: ''
    });  // テンプレートのデータ

    // テンプレートのフィールド変更時の処理
    const handleTemplateChange = (field, value) => {
        setTemplate((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    // Firestoreにテンプレートを保存する処理
    const handleSaveTemplate = async () => {
        try {
            const docRef = await addDoc(collection(db, 'ReservationTemplate'), template);  // 新しいテンプレートを作成
            alert(`テンプレートが保存されました！ID: ${docRef.id}`);
        } catch (error) {
            console.error('テンプレート保存時にエラーが発生しました: ', error);
        }
    };

    return (
        <div className="container">
            <h2>メッセージテンプレートの作成</h2>

            <form className="message-form">
                <label>Category:
                    <input
                        type="text"
                        value={template.Category}
                        onChange={(e) => handleTemplateChange('Category', e.target.value)}
                        placeholder="例: システム管理者"
                    />
                </label>

                <label>Memo:
                    <input
                        type="text"
                        value={template.Memo}
                        onChange={(e) => handleTemplateChange('Memo', e.target.value)}
                        placeholder="例: 自動予約のため"
                    />
                </label>

                <label>NickName:
                    <input
                        type="text"
                        value={template.NickName}
                        onChange={(e) => handleTemplateChange('NickName', e.target.value)}
                        placeholder="例: 開発者"
                    />
                </label>

                <label>Personal Name:
                    <input
                        type="text"
                        value={template.PersonalName}
                        onChange={(e) => handleTemplateChange('PersonalName', e.target.value)}
                        placeholder="例: 中村裕大"
                    />
                </label>

                <label>Email:
                    <input
                        type="email"
                        value={template.PostUserMail}
                        onChange={(e) => handleTemplateChange('PostUserMail', e.target.value)}
                        placeholder="例: example@example.com"
                    />
                </label>

                <div className="text-center">
                    <button type="button" onClick={handleSaveTemplate}>Save Template</button>
                </div>
            </form>
        </div>
    );
}

export default CreateReservationTemplate;
