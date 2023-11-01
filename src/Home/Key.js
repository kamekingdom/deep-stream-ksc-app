import React, { useContext, useEffect, useState } from 'react'
import { Footer, Header } from '../PageParts'
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import "../css/kame.css";
import { UserContext } from '../App';
import { Link } from 'react-router-dom';

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

    const DeleteKeyHolderClick = async () => {
        setIsClicked(true);
        const keyDocRef = doc(db, 'Key', 'Holder');
        const keyDocSnap = await getDoc(keyDocRef, { source: 'cache' });
        if (keyDocSnap.exists()) {
            await updateDoc(keyDocRef, {
                email: null,
                image: null,
                name: null,
                nickname: myName,
                time: new Date().toLocaleString()
            });
        } else {
            await setDoc(keyDocRef, {
                email: null,
                image: null,
                name: null,
                nickname: myName,
                time: new Date().toLocaleString()
            });
        }
        setIsAlreadyUploaded(true);
    };

    useEffect(() => {
        async function fetchFirestoreData() {
            let docRef = doc(db, 'users', auth.currentUser.email);
            let docSnap = await getDoc(docRef, { source: 'cache' });
            if (docSnap.exists()) {
                const docData = docSnap.data();
                setMyName(docData.PersonalName);
                setMyNickName(docData.NickName);
            }
        }
        fetchFirestoreData();
    }, []);

    const UploadKeyHolderClick = async (e) => {
        setIsClicked(true);
        if (auth.currentUser) {
            const keyDocRef = doc(db, 'Key', 'Holder');
            const keyDocSnap = await getDoc(keyDocRef, { source: 'cache' });
            if (keyDocSnap.exists()) {
                await updateDoc(keyDocRef, {
                    email: auth.currentUser.email,
                    image: auth.currentUser.photoURL,
                    name: myName,
                    nickname: myNickName,
                    time: new Date().toLocaleString()
                });
            } else {
                await setDoc(keyDocRef, {
                    email: auth.currentUser.email,
                    image: auth.currentUser.photoURL,
                    name: myName,
                    nickname: myNickName,
                    time: new Date().toLocaleString()
                });
            }
        }
        setIsAlreadyUploaded(true);
    };

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
    if (!isloaded) {
        return (
            <>
                <Header />
                {[...Array(8)].map((a, i) => <br key={i} />)}
                <div class="loader">Loading...</div>
                <Footer />
            </>
        )
    }
    else {
        return (
            <>
                <Header />
                <p className='kame_font_003'>鍵の場所</p>
                {name ?
                    <>
                        <center>
                            <img src={image} name="ユーザー画像" alt="ユーザー画像" /><br /><br />
                            <table class="kame_table_001">
                                <tr>
                                    <th>氏名</th>
                                    <td><p class="kame_font_001">{name}</p></td>
                                </tr>
                                <tr>
                                    <th>愛称</th>
                                    <td><p class="kame_font_001">{nickname}</p></td>
                                </tr>
                                <tr>
                                    <th>利用時刻</th>
                                    <td><p class="kame_font_001">{time}</p></td>
                                </tr>
                            </table>
                        </center>
                        <br /><br />
                        {
                            email == auth.currentUser.email ?
                                <>
                                    {
                                        !isclicked && !isalreadyuploaded &&
                                        <button to="/" class="kame_button_light_blue" onClick={DeleteKeyHolderClick}><p class="kame_font_002">返却</p></button>
                                    }
                                    {
                                        isclicked && !isalreadyuploaded &&
                                        <div class="loader">Loading...</div>
                                    }
                                    {
                                        isclicked && isalreadyuploaded &&
                                        <Link to="/" class="kame_button_light_blue"><p class="kame_font_002">完了</p></Link>
                                    }
                                </>
                                :
                                <></>
                        }
                    </>
                    :
                    <>
                        <center>
                            <img src="http://deepstream.boo.jp/kame_kingdom/DeepStreamApplication/manager.png" name="ユーザー画像" alt="ユーザー画像" /><br /><br />
                            <table class="kame_table_001">
                                <tr>
                                    <th>愛称</th>
                                    <td><p class="kame_font_001">管理人さん</p></td>
                                </tr>
                                <tr>
                                    <th>最終利用</th>
                                    <td><p class="kame_font_001">{nickname}</p></td>
                                </tr>
                                <tr>
                                    <th>返却時刻</th>
                                    <td><p class="kame_font_001">{time}</p></td>
                                </tr>
                            </table>
                        </center>
                        <br /><br />
                        {
                            !isclicked && !isalreadyuploaded &&
                            <>
                                <button to="/" class="kame_button_light_blue" onClick={UploadKeyHolderClick}><p class="kame_font_002">利用開始</p></button><br />
                            </>
                        }
                        {
                            isclicked && !isalreadyuploaded &&
                            <div class="loader">Loading...</div>
                        }
                        {
                            isclicked && isalreadyuploaded &&
                            <Link to="/" class="kame_button_light_blue"><p class="kame_font_002">完了</p></Link>
                        }
                    </>
                }
                <Footer />
            </>
        )
    }
}

export default Key
