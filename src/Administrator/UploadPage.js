import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import './UploadPage.css'; // CSSファイルのインポート

const UploadPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // 現在の年
    const [uploading, setUploading] = useState(false);

    const firestore = getFirestore();
    const storage = getStorage();

    // Firestoreからpageとyearを取得
    useEffect(() => {
        const fetchFirestoreData = async () => {
            const docRef = doc(firestore, "Setting", "DeepMagazine");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                let { page, year } = data;

                // yearの確認，異なる場合はpageを0にリセット
                if (year !== currentYear) {
                    page = 0;
                    year = currentYear;
                    await updateDoc(docRef, { page, year });
                }
                setCurrentPage(page);
            }
        };

        fetchFirestoreData();
    }, [firestore, currentYear]);

    // アップロード処理
    const handleFileUpload = async (file) => {
        setUploading(true);
        try {
            // page + 1 でファイル名生成（ページを2桁の文字列にフォーマット）
            const newPage = currentPage + 1;
            const formattedPage = String(newPage).padStart(2, '0'); // 2桁にパディング
            const fileName = `DeepMagazine_${currentYear}_${formattedPage}.jpg`;

            // Storageへのアップロード
            const storageRef = ref(storage, `DeepMagazine/${fileName}`);
            await uploadBytes(storageRef, file);

            // Firestoreのpageを更新 (pageをインクリメント)
            const docRef = doc(firestore, "Setting", "DeepMagazine");
            await updateDoc(docRef, { page: newPage });

            setCurrentPage(newPage); // ローカルstateも更新
            alert("ファイルが正常にアップロードされました！");
        } catch (error) {
            console.error("アップロードエラー: ", error);
            alert("アップロードに失敗しました");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <h2>画像アップロード</h2>
            {uploading ? (
                <div className="loading-spinner"></div>
            ) : (
                <>
                    <input
                        type="file"
                        accept="image/jpeg"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                    <button disabled={uploading}>アップロード</button>
                </>
            )}
        </div>
    );
};

export default UploadPage;
