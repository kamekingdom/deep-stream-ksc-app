import React, { useState } from 'react'
import { Footer, Header } from '../PageParts'
import { Link } from 'react-router-dom';
import { auth } from '../firebase';

function AdminLogin() {
    const [Command, setCommand] = useState("");
    const adminCommand = "iamkamekingdom";
    var date = new Date();
    var NowHour = date.getHours();
    var NowMinute = date.getMinutes();

    const handleCommand = (e) => {
        setCommand(e.target.value);
    }
    return (
        <div>
            <Header />
            <p className="kame_font_003">コマンド</p><br />
            <center>
                <label>
                    <textarea type="text" className="kame_textarea_small" onChange={handleCommand} placeholder="" value={Command} /><br /><br />
                </label>
            </center>
            <br /><br />
            {Command === adminCommand && (
                <Link to="/adminhome" className="kame_button_light_blue">
                    <p className="kame_font_002">管理者画面</p>
                </Link>
            )}
            {Command.toLowerCase() === "preview" && (
                <Link to="/reservation-preview" className="kame_button_light_blue">
                    <p className="kame_font_002">予約プレビュー</p>
                </Link>
            )}
            {Command.toLowerCase() === "game" && (
                <p class="kame_font_003">現在開発中...<br />お楽しみに</p>
            )}
            {Command.toLowerCase() === "hello" && (<p class="kame_font_003">こんにちは。<br />{auth.currentUser.displayName}さん<br /></p>)}
            {Command.toLowerCase() === "good morning" && (<p class="kame_font_003">おはようござんす<br />{auth.currentUser.displayName}さん<br /></p>)}
            {Command.toLowerCase() === "good evening" && (<p class="kame_font_003">こんばんは。<br />{auth.currentUser.displayName}さん</p>)}
            {Command.toLowerCase() === "good night" && (<p class="kame_font_003">おやすみなさい<br />{auth.currentUser.displayName}さん<br /></p>)}
            {Command.toLowerCase() === "time" && (<p class="kame_font_003">現在時刻は<br />{NowHour}時{NowMinute}分です<br /></p>)}
            {Command.toLowerCase() === "kame" && (<p class="kame_font_003">こんにちは、かめです🐢</p>)}
            {Command.toLowerCase() === "cmd" && (<p class="kame_font_003">遊び心で作ってみました🐢</p>)}
            {Command.toLowerCase() === "command" && (<p class="kame_font_003">遊び心で作ってみました🐢</p>)}
            {Command.toLowerCase() === "reserve" && (
                <Link to="/reservation" className="kame_button_light_blue">
                    <p className="kame_font_002">部室予約</p>
                </Link>
            )}
            {Command.toLowerCase() === "reservation" && (
                <Link to="/reservation" className="kame_button_light_blue">
                    <p className="kame_font_002">部室予約</p>
                </Link>
            )}
            {Command.toLowerCase() === "calendar" && (
                <Link to="/calendar" className="kame_button_light_blue">
                    <p className="kame_font_002">カレンダー</p>
                </Link>
            )}
            {Command.toLowerCase() === "event" && (
                <Link to="/notification" className="kame_button_light_blue">
                    <p className="kame_font_002">イベント</p>
                </Link>
            )}
            {Command.toLowerCase() === "home" && (
                <Link to="/" className="kame_button_light_blue">
                    <p className="kame_font_002">ホーム</p>
                </Link>
            )}
            {Command.toLowerCase() === "tool" && (
                <Link to="/tool" className="kame_button_light_blue">
                    <p className="kame_font_002">ツール</p>
                </Link>
            )}
            {Command.toLowerCase() === "youtube" && (
                <a href="https://www.youtube.com/channel/UCg9WNSATUeU8g5p2O4mHS_w" className="kame_button_light_blue">
                    <p className="kame_font_002">YouTube</p>
                </a>
            )}
            {Command.toLowerCase() === "instagram" && (
                <a href="https://www.instagram.com/deepstreamksc/" className="kame_button_light_blue">
                    <p className="kame_font_002">Instagram</p>
                </a>
            )}
            {Command.toLowerCase() === "twitter" && (
                <>
                    <a href="https://www.instagram.com/deepstreamksc/" className="kame_button_light_blue">
                        <p className="kame_font_002">Instagram</p></a>
                    <p class="kame_font_003">あ、間違えちゃった...</p>
                </>
            )}

            <Footer />
        </div>
    )
}

export default AdminLogin
