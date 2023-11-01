import React from 'react'
import { Footer, Header } from '../PageParts'
import { Link } from 'react-router-dom'
import "../css/kame.css"

function Tool() {
    return (
        <>
            <Header />
            <p class="kame_font_003">ツール</p>
            <a href="https://1drv.ms/f/s!AtMlHWLLja-6f3QqsYbzs7NejHc?e=cZDkyF" class="kame_button_light_blue"><p class="kame_font_002">資料</p></a><br />
            <a href="https://forms.gle/cPv4ka6w32PTJXkS6" class="kame_button_light_blue"><p class="kame_font_002">意見箱</p></a><br />
            <a href="https://forms.gle/Suc9yd9hvFqefcGM8" class="kame_button_light_blue"><p class="kame_font_002">お問い合わせ</p></a><br />
            <Link to="/notification" class="kame_button_light_blue"><p class="kame_font_002">提出書類</p></Link><br />
            <Link to="/adminlogin" class="kame_button_light_blue"><p class="kame_font_002">コマンド</p></Link><br />
            <Footer />
        </>
    )
}

export default Tool