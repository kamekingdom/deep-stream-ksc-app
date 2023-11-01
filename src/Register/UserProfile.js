import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Header } from '../PageParts';
import { Link } from 'react-router-dom';

function UserProfile() {
    const [user] = useAuthState(auth);
    const [profile, setProfile] = useState(null);
    const firestore = getFirestore();

    useEffect(() => {
        const fetchProfileData = async () => {
            if (user && !profile) {
                const userDocRef = doc(firestore, 'users', auth.currentUser.email);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setProfile(userDoc.data());
                }
            }
        };

        fetchProfileData();
    }, [user, profile, firestore]);

    return (
        <div>
            {profile ? (
                <div>
                    <Header /><br /><br />
                    <div class="login-page">
                        <div class="form">
                            <center>
                                <p class="kame_font_002">プロフィール情報</p>
                                <p className='kame_font_001'>メールアドレス</p>
                                <textarea class="kame_textarea_small" readOnly value={user.email} />
                                <br />
                                <p className='kame_font_001'>学籍番号</p>
                                <textarea class="kame_textarea_small" readOnly value={profile.StudentNumber} />
                                <br />
                                <p className='kame_font_001'>氏名</p>
                                <textarea class="kame_textarea_small" readOnly value={profile.PersonalName} />
                                <br />
                                <p className='kame_font_001'>ニックネーム</p>
                                <textarea class="kame_textarea_small" readOnly value={profile.NickName} />
                                <br /><br /><hr/><br />
                                <Link to="/" className='kame_button_light_blue'><p className='kame_font_001'>ホーム</p></Link>
                            </center>
                        </div>
                    </div>
                </div>
            ) : (
                <div class="loader">Loading...</div>
            )}
        </div>
    );
}

export default UserProfile;
