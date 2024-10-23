import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";
import './UploadPage.css'; // CSSファイルのインポート

const UploadPage = () => {
    const [pages, setPages] = useState([]); // ページのリスト
    const [currentYear] = useState(new Date().getFullYear()); // 現在の年
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    const firestore = getFirestore();
    const storage = getStorage();

    // 既存の画像を取得する
    useEffect(() => {
        const fetchExistingPages = async () => {
            const storageRef = ref(storage, `DeepMagazine/`);
            const result = await listAll(storageRef); // DeepMagazineフォルダ内の全ファイルを取得

            const filePromises = result.items.map(async (fileRef) => {
                const url = await getDownloadURL(fileRef); // 各ファイルのダウンロードURLを取得
                return { fileName: fileRef.name, url }; // ファイル名とURLを返す
            });

            const files = await Promise.all(filePromises);
            setPages(files);
            setLoading(false);
        };

        fetchExistingPages();
    }, [storage]);

    // アップロード処理
    const handleFileUpload = async (file) => {
        setUploading(true);
        try {
            const pageId = Date.now().toString(); // ユニークなIDを生成
            const fileName = `DeepMagazine_${currentYear}_${pageId}.jpg`;

            // Storageへのアップロード
            const storageRef = ref(storage, `DeepMagazine/${fileName}`);
            await uploadBytes(storageRef, file);

            const fileUrl = await getDownloadURL(storageRef);

            const newPage = { fileName, url: fileUrl };

            const updatedPages = [...pages, newPage];

            // Firestoreのpages配列を更新
            const docRef = doc(firestore, "Setting", "DeepMagazine");
            await updateDoc(docRef, {
                pages: updatedPages
            });

            setPages(updatedPages); // ローカルstateも更新
            alert("ファイルが正常にアップロードされました！");
        } catch (error) {
            console.error("アップロードエラー: ", error);
            alert("アップロードに失敗しました");
        } finally {
            setUploading(false);
        }
    };

    // ファイルの削除処理
    const handleDeletePage = async (fileName) => {
        if (!window.confirm("このページを削除しますか？")) return;

        try {
            // Storageから削除
            const storageRef = ref(storage, `DeepMagazine/${fileName}`);
            await deleteObject(storageRef);

            // Firestoreのpages配列を更新
            const updatedPages = pages.filter(page => page.fileName !== fileName);
            const docRef = doc(firestore, "Setting", "DeepMagazine");
            await updateDoc(docRef, {
                pages: updatedPages
            });

            setPages(updatedPages); // ローカルstateも更新
            alert("ファイルが削除されました！");
        } catch (error) {
            console.error("削除エラー: ", error);
            alert("ファイルの削除に失敗しました");
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
                    <button disabled={uploading} style={{ display: "none" }}>アップロード</button>
                </>
            )}
            <h2>既存のページプレビュー</h2>
            <div className="pages-list">
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : (
                    <div className="preview-grid">
                        {pages.map((page, index) => (
                            <div key={index} className="page-item">
                                <img src={page.url} alt={`Page ${index + 1}`} className="page-thumbnail" />
                                <p className="file-name">{truncateFileName(page.fileName)}</p>
                                <button className="delete-button" onClick={() => handleDeletePage(page.fileName)}>
                                    削除
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ファイル名をコンパクトに表示するために短縮
const truncateFileName = (fileName) => {
    const maxLength = 15; // 表示する最大文字数を短縮
    if (fileName.length > maxLength) {
        return fileName.substring(0, maxLength) + '...';
    }
    return fileName;
};

export default UploadPage;
