import React, { useContext, useEffect, useState } from 'react'
import { Footer, Header } from '../PageParts'
import { InfoContext, ScheduleContext, useBlockBrowserBack } from '../App'
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function ScheduleDetail() {
    /* スケジュール情報変数 */
    const ScheduleInfo = useContext(ScheduleContext); // 共有変数の取得

    const month = ScheduleInfo.Month; // 月
    const date = ScheduleInfo.Date; // 日
    const day = ScheduleInfo.Day // 曜日
    const title = ScheduleInfo.Title // タイトル
    const content = ScheduleInfo.Content // 内容
    const link = ScheduleInfo.Link // リンク
    const category = ScheduleInfo.Category // カテゴリ

    return (
        <>
            <Header />
            <div class="kame_header_003"><p class="kame_font_004">{title}</p></div>
            <p class="kame_font_003">{month}/{date}({day})</p>

            <p class="kame_font_002">
            </p>
            <center>
                <textarea class="kame_textarea" placeholder={content} readOnly />
                {link && <a href={link}><textarea class="kame_textarea_small" value={link.slice(0,30)} style={{color:"green"}} readOnly/></a>}
            </center>

            <br /><br /><br />
            <Footer />
        </>
    )
}

export default ScheduleDetail