import React from 'react'
import { Footer, Header } from '../PageParts'
import { Link } from 'react-router-dom'
import "../css/kame.css"

function AdminHome() {
  return (
    <>
      <Header />
      <p class="kame_font_003">開発者画面</p>
      <Link to="/admineventpost" class="kame_button_light_blue"><p class="kame_font_002">提出書類作成</p></Link><br />
      <Link to="/adminschedulepost" class="kame_button_light_blue"><p class="kame_font_002">イベント作成</p></Link><br />
      <Link to="/upload-page" class="kame_button_light_blue"><p class="kame_font_002">Deep Magazine</p></Link><br />
      <Link to="/create-reservation-settings" class="kame_button_light_blue"><p class="kame_font_002">緊急予約</p></Link><br />
      <Link to="/create-reservation-template" class="kame_button_light_blue"><p class="kame_font_002">予約テンプレ</p></Link><br />
      <a href="https://github.com/DeepStream-KSC/deepstreamksc" class="kame_button_light_blue"><p class="kame_font_002">ソースコード</p></a><br />
      <Footer />
    </>
  )
}

export default AdminHome