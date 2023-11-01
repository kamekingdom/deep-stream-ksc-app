import React, { useContext } from 'react'
import { Footer, Header } from '../PageParts'
import { ReservationContext, useBlockBrowserBack } from '../App'
import { Link } from 'react-router-dom'

function AlertReservation() {
    const ReservationInfo = useContext(ReservationContext)

    return (
        <div>
            <Header />
            <center>
            <div class="kame_header_003"><p class="kame_font_004">{ReservationInfo.WeekDay}曜日</p></div>
            <p class="kame_font_003">{ReservationInfo.TimeSlot}({ReservationInfo.Time})</p>
            <textarea class="kame_textarea" placeholder="※過去の投稿は編集できません" readOnly/><br/><br/><br/><br/>
            <Link class="kame_button_light_blue" to="/reservation"><p className='kame_font_002'>部室予約へ</p></Link>
            </center>
            <Footer />
        </div>
    )
}

export default AlertReservation