import React, { useContext, useEffect, useState } from 'react';
import { Footer, Header } from '../PageParts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import "../css/kame.css";
import "../css/qrScanner.css";
import { UserContext } from '../App';
import { Link } from 'react-router-dom';
import QrScanner from 'react-qr-scanner';

function Key() {
    const [name, setName] = useState("");
    const [nickname, setNickName] = useState("");
    const [myName, setMyName] = useState("");
    const [myNickName, setMyNickName] = useState("");
    const [email, setEmail] = useState("");
    const [image, setImage] = useState("");
    const [time, setTime] = useState("");
    const [isloaded, setIsLoaded] = useState(false);
    const [isclicked, setIsClicked] = useState(false);
    const [isalreadyuploaded, setIsAlreadyUploaded] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [prevScanResult, setPrevScanResult] = useState(null);


    // カメラデバイスIDを保持するstate
    // const [videoDevices, setVideoDevices] = useState([]);
    // const [selectedDeviceId, setSelectedDeviceId] = useState("");

    // const DeleteKeyHolderClick = async () => {
    //     setIsClicked(true);
    //     const keyDocRef = doc(db, 'Key', 'Holder');
    //     const keyDocSnap = await getDoc(keyDocRef, { source: 'cache' });
    //     if (keyDocSnap.exists()) {
    //         await updateDoc(keyDocRef, {
    //             email: null,
    //             image: null,
    //             name: null,
    //             nickname: myName,
    //             time: new Date().toLocaleString()
    //         });
    //     } else {
    //         await setDoc(keyDocRef, {
    //             email: null,
    //             image: null,
    //             name: null,
    //             nickname: myName,
    //             time: new Date().toLocaleString()
    //         });
    //     }
    //     setIsAlreadyUploaded(true);
    // };

    // const UploadKeyHolderClick = async () => {
    //     setIsClicked(true);
    //     if (auth.currentUser) {
    //         const keyDocRef = doc(db, 'Key', 'Holder');
    //         const keyDocSnap = await getDoc(keyDocRef, { source: 'cache' });
    //         if (keyDocSnap.exists()) {
    //             await updateDoc(keyDocRef, {
    //                 email: auth.currentUser.email,
    //                 image: auth.currentUser.photoURL,
    //                 name: myName,
    //                 nickname: myNickName,
    //                 time: new Date().toLocaleString()
    //             });
    //         } else {
    //             await setDoc(keyDocRef, {
    //                 email: auth.currentUser.email,
    //                 image: auth.currentUser.photoURL,
    //                 name: myName,
    //                 nickname: myNickName,
    //                 time: new Date().toLocaleString()
    //             });
    //         }
    //     }
    //     setIsAlreadyUploaded(true);
    // };

    // const handleScan = (data) => {
    //     if (data) {
    //         setScanResult(data.text);

    //         // スキャン結果に基づいた処理を実行
    //         if (data.text.includes("borrow")) {
    //             UploadKeyHolderClick();
    //         } else if (data.text.includes("return")) {
    //             DeleteKeyHolderClick();
    //         }

    //         // 読み取り完了後に`prevScanResult`をリセット
    //         setPrevScanResult(null);
    //     }
    // };

    // const handleError = (err) => {
    //     console.error(err);
    // };

    useEffect(() => {
        async function fetchFirestoreData() {
            if (auth.currentUser) {
                let docRef = doc(db, 'users', auth.currentUser.email);
                let docSnap = await getDoc(docRef, { source: 'cache' });
                if (docSnap.exists()) {
                    const docData = docSnap.data();
                    setMyName(docData.PersonalName);
                    setMyNickName(docData.NickName);
                }
            }
        }
        fetchFirestoreData();
    }, []);

    useEffect(() => {
        async function fetchFirestoreData() {
            let docRef = doc(db, 'Key', 'Holder');
            let docSnap = await getDoc(docRef, { source: 'cache' });
            if (docSnap.exists()) {
                const docData = docSnap.data();
                setName(docData.name);
                setNickName(docData.nickname);
                setEmail(docData.email);
                setImage(docData.image || 'http://deepstream.boo.jp/kame_kingdom/DeepStreamApplication/using.png');
                setTime(docData.time);
            }
            setIsLoaded(true);
        }
        fetchFirestoreData();
    }, []);

    // useEffect(() => {
    //     async function getVideoDevices() {
    //         try {
    //             // カメラアクセスの許可をリクエスト
    //             await navigator.mediaDevices.getUserMedia({ video: true });

    //             // カメラアクセスの許可が得られた後にデバイスを取得
    //             const devices = await navigator.mediaDevices.enumerateDevices();
    //             const videoDevices = devices.filter(device => device.kind === 'videoinput');

    //             setVideoDevices(videoDevices);

    //             // デフォルトで外カメラを選択（"back"または"rear"が含まれるデバイスを優先）
    //             const defaultDevice = videoDevices.find(device =>
    //                 device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear") || device.label.toLowerCase().includes("背面")
    //             ) || videoDevices[0]; // 外カメラが見つからない場合は最初のカメラを使用

    //             setSelectedDeviceId(defaultDevice.deviceId);
    //         } catch (error) {
    //             console.error("Error accessing media devices.", error);
    //         }
    //     }
    //     getVideoDevices();
    // }, []);



    // const handleDeviceChange = (event) => {
    //     setSelectedDeviceId(event.target.value);
    // };

    if (!isloaded) {
        return (
            <>
                <Header />
                {[...Array(8)].map((a, i) => <br key={i} />)}
                <div className="loader">Loading...</div>
                <Footer />
            </>
        );
    } else {
        return (
            <>
                <Header />
                <div className="kame_header_003"><p className="kame_font_003">鍵の場所</p></div>
                {/* カメラ選択ドロップダウン */}
                {/* <div className="camera-selection">
                    <label htmlFor="cameraSelect">カメラを選択してください：</label>
                    <select id="cameraSelect" value={selectedDeviceId} onChange={handleDeviceChange}>
                        {videoDevices.map((device, index) => (
                            <option key={index} value={device.deviceId}>{device.label || `カメラ ${index + 1}`}</option>
                        ))}
                    </select>
                </div> */}

                {/* <div className="qr-container">
                    <QrScanner
                        delay={100} // デフォルトより速くするために100msに設定
                        style={{ width: '100%' }}
                        onError={handleError}
                        onScan={handleScan}
                        constraints={{ video: { deviceId: selectedDeviceId } }}
                    />
                    <div className="qr-frame">
                        <div className="corner top-left"></div>
                        <div className="corner top-right"></div>
                        <div className="corner bottom-left"></div>
                        <div className="corner bottom-right"></div>
                    </div>
                </div> */}
                <center>
                    <p
                        style={{
                            display: "inline-block",
                            border: "5px solid",
                            borderColor: name ? "#ad4241" : "#446ead", // 利用中: 赤, 利用可能: 緑
                            borderRadius: "10px",
                            padding: "20px 100px",
                            textAlign: "center",
                            fontSize: "3.0em",
                            color: name ? "#ad4241" : "#446ead",
                            backgroundColor: name ? "#ffdef4" : "#def4ff"
                        }}
                    >
                        {name ? "利用中" : "利用可能"}
                    </p>
                </center>
                {
                    name ?
                        <>
                            <center>
                                <table className="kame_table_001">
                                    <tr>
                                        <th>
                                            <p className="kame_font_002">所持者</p>
                                        </th>
                                        <td>
                                            <p className="kame_font_002">{name}</p>
                                            <p className="kame_font_002">{nickname}</p>

                                        </td>
                                    </tr>
                                    <tr>
                                        <th><p className="kame_font_002">開始時刻</p></th>
                                        <td><p className="kame_font_002">{time}</p></td>
                                    </tr>
                                </table>
                            </center>
                            <br /><br />
                            {
                                email === auth.currentUser.email ?
                                    <>
                                        <Link to="/key-access" class="kame_button_light_blue"><p class="kame_font_002">返却</p></Link>

                                        {
                                            isclicked && !isalreadyuploaded &&
                                            <div className="loader">Loading...</div>
                                        }
                                        {
                                            isclicked && isalreadyuploaded &&
                                            <Link to="/" className="kame_button_light_blue"><p className="kame_font_002">完了</p></Link>
                                        }
                                    </> :
                                    <>
                                        <Link to="/key-access" class="kame_button_light_blue"><p class="kame_font_002">利用開始</p></Link>
                                    </>
                            }
                        </>
                        :
                        <>
                            <center>
                                <table className="kame_table_001">
                                    {/* <tr>
                                        <th><p className="kame_font_002">所持者</p></th>
                                        <td><p className="kame_font_002">管理人さん</p></td>
                                    </tr> */}
                                    <tr>
                                        <th><p className="kame_font_002">最終利用</p></th>
                                        <td>
                                            <p className="kame_font_002">{name}</p>
                                            <p className="kame_font_002">{nickname}</p>

                                        </td>
                                    </tr>
                                    <tr>
                                        <th><p className="kame_font_002">返却時刻</p></th>
                                        <td><p className="kame_font_002">{time}</p></td>
                                    </tr>
                                </table>
                            </center>
                            <br /><br />
                            <Link to="/key-access" class="kame_button_light_blue"><p class="kame_font_002">利用開始</p></Link>

                            {
                                isclicked && !isalreadyuploaded &&
                                <div className="loader">Loading...</div>
                            }
                            {
                                isclicked && isalreadyuploaded &&
                                <Link to="/" className="kame_button_light_blue"><p className="kame_font_002">完了</p></Link>
                            }
                        </>
                }
                <Footer />
            </>
        );
    }
}

export default Key;
