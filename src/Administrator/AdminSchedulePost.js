import React, { useRef, useState } from 'react';
import { Footer, Header } from '../PageParts';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

function AdminSchedulePost() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [dayofweek, setDayofWeek] = useState("");
  const [category, setCategory] = useState("1");
  const [content, setContent] = useState("");
  const dateInputRef = useRef(null);

  const [isalreadyuploaded, setIsAlreadyUploaded] = useState(false);

  const handleUploadClick = async (e) => {
    const docName = "2023" + month.toString().padStart(2, "0") + day.toString().padStart(2, "0");
    // Firestoreに投稿を追加
    const schedulesRef = doc(db, 'Schedules', docName);
    await setDoc(schedulesRef, {
      title: title,
      link: link,
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      dayofweek: dayofweek,
      content: content,
      category: category
    });
    setIsAlreadyUploaded(true);
  };

  const handleSelectChange1 = (e) => { setCategory(e.target.value); }
  const handleSelectChange2 = (e) => { setTitle(e.target.value); }
  const handleSelectChange4 = (e) => { setLink(e.target.value); }
  const handleSelectChange8 = (e) => { setContent(e.target.value); }
  function handleSelectChange9() {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"]
    const dateString = dateInputRef.current.value;
    const dateObject = new Date(dateString);
    setMonth(dateObject.getMonth() + 1); // 月を取得する
    setDay(dateObject.getDate()); // 日を取得する
    setDayofWeek(weekdays[dateObject.getDay()]); // 曜日を取得する

  }
  return (
    <>
      <Header />
      <center>
        <p className="kame_font_003">スケジュール投稿画面</p>
        <input type="date" ref={dateInputRef} onChange={handleSelectChange9}
          style={{
            width: "400px",
            height: "80px",
            borderRadius: "10px",
            border: "1px solid gray",
            fontSize: "16px",
            padding: "5px",
            fontSize: "2.0em"
          }}
        /><br /><br /><br />
        <form>
          <label class="kame_select_005">
            <select onChange={handleSelectChange1}>
              <option value="1">ライブ</option>
              <option value="2">イベント</option>
              <option value="3">メモ</option>
              <option value="0">その他</option>
            </select>
          </label>
        </form><br />
        <label><textarea class="kame_textarea_small" onChange={handleSelectChange2} placeholder="タイトル" minLength={"0"} maxLength={"20"} value={title} /></label>
        <label><textarea class="kame_textarea" onChange={handleSelectChange8} placeholder="内容" value={content} /></label>
        <label><textarea class="kame_textarea_small" style={{ fontSize: "2.0em" }} onChange={handleSelectChange4} placeholder="リンク" minLength={"0"} value={link} /></label>
        <br /><br /><br />
        {title && month && content && category && !isalreadyuploaded &&
          <button class="kame_button_black" onClick={handleUploadClick}><p class="kame_font_002">送信</p></button>
        }
        {isalreadyuploaded &&
          <Link to="/adminhome" class="kame_button_black"><p class="kame_font_002">完了</p></Link>
        }
      </center>
      <Footer />
    </>
  )
}

export default AdminSchedulePost