import React from 'react'
import { Footer, Header } from '../PageParts'
import { Link } from 'react-router-dom'
import "../css/kame.css"

function Tool() {
    return (
        <>
            <Header />
            <p class="kame_font_003">ツール</p>
            <Link to="/adminlogin" class="kame_button_light_blue"><p class="kame_font_002">コマンド</p></Link><br />
            <a href="https://1drv.ms/f/s!AtMlHWLLja-6f3QqsYbzs7NejHc?e=cZDkyF" class="kame_button_light_blue"><p class="kame_font_002">資料</p></a><br />
            <a href="https://forms.gle/MPeRmvmbRJRzjQD48" class="kame_button_light_blue"><p class="kame_font_002">お問い合わせ</p></a><br />
            <Footer />
        </>
    )
}

export default Tool