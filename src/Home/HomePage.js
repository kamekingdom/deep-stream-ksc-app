import React, { useEffect, useState } from "react";
import { Footer, Header } from "../PageParts";
import "../css/kame.css";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  writeBatch,
} from "firebase/firestore";
import { db, } from "../firebase";
import moment from "moment";
import { } from "react-firebase-hooks/auth";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import useIsMobile from "../function/isMobile";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Navigation,
  Pagination,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

async function fetchFilesFromDeepMagazine() {
  const storage = getStorage();
  const deepMagazineRef = ref(storage, "DeepMagazine");

  try {
    const result = await listAll(deepMagazineRef);
    const files = result.items;

    // URLを取得する非同期操作
    const fileUrls = await Promise.all(
      files.map((fileRef) => getDownloadURL(fileRef)),
    );

    // 名前の降順でソート
    fileUrls.sort((a, b) => (a < b ? 1 : -1));
    // console.log(fileUrls);

    return fileUrls;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error; // <-- 追加：エラーをスロー
  }
}

function HomePage() {
  const isMobile = useIsMobile();

  /* スプラッシュスクリーンの表示設定 */
  // Deep Magazineの取得
  const [show, setShow] = useState(true); // スプラッシュスクリーンをshowするか否か
  const [imageUrls, setFiles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const startTime = Date.now(); // データ取得の開始時間を記録

        const data = await fetchFilesFromDeepMagazine();
        setFiles(data);
        console.log(data)
        const elapsed = Date.now() - startTime; // データ取得にかかった時間を計算
        const delay = Math.max(0, 3000 - elapsed); // 3秒経過するまでに残りの時間を計算

        setTimeout(() => {
          setShow(false); // データが正常に取得され、3秒経過した後にスプラッシュスクリーンを非表示にする
        }, delay);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    fetchData();
  }, []);

  // Firestoreから予約設定データを取得し、自動予約を行う
  async function addReservations() {
    let batch = writeBatch(db);
    let batchSize = 0;
    const maxBatchSize = 500; // Firestoreのバッチサイズの制限

    // 1. Firestoreから予約スケジュールを取得
    const schedulesSnapshot = await getDocs(collection(db, 'ReservationSchedules'));

    for (const scheduleDoc of schedulesSnapshot.docs) {
      const day = scheduleDoc.id;
      const { Reservations } = scheduleDoc.data();  // 各日の `Reservations` 配列を取得

      // 2. `Reservations` 配列の各テンプレートIDごとに予約を実行
      for (const reservation of Reservations) {
        const { TemplateID, TimeSlots } = reservation;

        // 3. Firestoreからテンプレートを取得
        const templateDoc = await getDoc(doc(db, 'ReservationTemplate', TemplateID));
        if (!templateDoc.exists()) {
          console.error(`テンプレートID ${TemplateID} に該当するテンプレートが見つかりません。`);
          continue;
        }

        const templateData = templateDoc.data();

        // 4. 各タイムスロットに対して予約を作成
        for (const timeSlot of TimeSlots) {
          const reservationDoc = doc(db, day, timeSlot);  // 各タイムスロットのドキュメント
          batch.set(reservationDoc, {
            ...templateData,  // テンプレートの内容をコピー
            TimeSlot: timeSlot,
            WeekDay: day,
            ReservationNum: 0  // 初期状態の予約数
          });

          batchSize++;

          // バッチのサイズが上限に達したらコミットし、新しいバッチを作成
          if (batchSize >= maxBatchSize) {
            await batch.commit();
            batch = writeBatch(db);
            batchSize = 0;
          }
        }
      }
    }

    // 最後のバッチをコミット
    if (batchSize > 0) {
      await batch.commit();
    }

    console.log('予約処理が完了しました。');
  }

  // ReservationSettings コレクションを削除する処理
  async function deleteReservationSettings() {
    try {
      // FirestoreからReservationSettingsコレクションのすべてのドキュメントを取得
      const settingsSnapshot = await getDocs(collection(db, 'ReservationSettings'));

      // ドキュメントを一つずつ削除
      const deleteOps = settingsSnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // 全ての削除操作が完了するまで待機
      await Promise.all(deleteOps);

      console.log('ReservationSettingsが削除されました。');
    } catch (error) {
      console.error('ReservationSettingsの削除中にエラーが発生しました:', error);
    }
  }


  // ここでリセット
  useEffect(() => {
    async function fetchFirestoreData() {
      const today = moment();
      const dayOfWeek = today.day(); // 0 (日曜日) から 6 (土曜日) の範囲で取得できます

      // 日曜日、月曜日、火曜日以外は処理をスキップします
      if (dayOfWeek !== 0 && dayOfWeek !== 1 && dayOfWeek !== 2) {
        return;
      }

      const docRef = doc(db, "Setting", "Reservation");
      const docSnap = await getDoc(docRef, { source: "cache" });
      const sunday = today.clone().startOf("week");
      if (
        docSnap.exists() &&
        docSnap.data().LastResetDate === sunday.format("YYYYMMDD")
      ) {
        return;
      }
      console.log("Reset Reservation Data");
      const batch = writeBatch(db);
      const settingRef = doc(db, "Setting", "Reservation");
      batch.set(settingRef, { LastResetDate: sunday.format("YYYYMMDD") });
      const usersRef = collection(db, "users");
      const reservationNumQuery = query(usersRef);
      const userDocs = await getDocs(reservationNumQuery);
      userDocs.forEach((doc) => {
        batch.update(doc.ref, { ReservationNum: 0 });
      });
      const deleteOps = [];
      const WeekDayList = ["月", "火", "水", "木", "金", "土", "日"];
      const TimeSlotList = [
        "朝練",
        "１限",
        "チャペル",
        "２限",
        "昼練",
        "３限",
        "４限",
        "５限",
        "夜練Ⅰ",
        "夜練Ⅱ",
      ];
      WeekDayList.forEach((weekday) => {
        TimeSlotList.forEach((timeslot) => {
          const docToDelete = doc(db, weekday, timeslot);
          deleteOps.push(deleteDoc(docToDelete));
        });
      });
      await Promise.all(deleteOps);
      await batch.commit();
      console.log("fin");

      // 初期化後に複数の曜日に予約を追加する
      await addReservations();

      // ReservationSettingsを削除
      await deleteReservationSettings();
    }


    fetchFirestoreData();
  }, []);

  const [imageUrl, setImageUrl] = useState(null);
  useEffect(() => {
    if (imageUrls.length > 0) {
      setImageUrl(imageUrls[0]);
    }
  }, [imageUrls]);



  return show ? (
    <div>
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8410469642859077"
        crossorigin="anonymous"
      ></script>
      <div id="container">
        <span></span>
        <span></span>
        <span></span>
        <p style={{ fontSize: "2.0em" }}>Deep Stream</p>
        <p style={{ fontSize: "1.5em" }}>ver 3.1.1</p>
      </div>
    </div>
  ) : isMobile ? (
    <>
      <Header />
      <center>
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Qwitcher+Grypen:wght@700&display=swap');
        </style>
        <p
          style={{
            fontSize: "6.0em",
            fontFamily: "Qwitcher Grypen",
            // height: "0.5em",
          }}
        >
          &nbsp;&nbsp;Deep Magazine&nbsp;&nbsp;
        </p>

        {/* <iframe style={{aspectRatio:"8/4"}} width="80%" src="https://www.youtube.com/embed/oJKhbRFKIjQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe> */}

        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          modules={[Autoplay, Pagination, Navigation]}
          pagination={{ clickable: true }}
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
          navigation
          scrollbar={{ draggable: true }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          height={"1500px"}
        >
          {imageUrls.map((url, index) => (
            <SwiperSlide key={index}>
              <img
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                src={url}
                alt={`Slide ${index + 1}`}
              />
            </SwiperSlide>
          ))}

          {/* <div className="autoplay-progress" slot="container-end">
          <svg viewBox="0 0 48 48" ref={progressCircle}>
            <circle cx="24" cy="24" r="20"></circle>
          </svg>
          <span ref={progressContent}></span>
        </div> */}
        </Swiper>

        {/* <img
        style={{ width: "75%", cursor: "grab" }}
        src={imageUrl}
        alt="Image"
      />
       */}

        {/* <div>
          <SwiperImage data={data}/>
        </div> */}

        {/* <p className="kame_font_003">
          <button
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
            }}
            onClick={previousPage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              fill="currentColor"
              class="bi bi-arrow-left-square"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm11.5 5.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"
              />
            </svg>
          </button>
          &emsp;{page + 1}&nbsp;/&nbsp;{imageUrls.length}&emsp;
          <button
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
            }}
            onClick={nextPage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              fill="currentColor"
              class="bi bi-arrow-right-square"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"
              />
            </svg>
          </button>
        </p> */}
      </center>
      <Footer />
    </>
  ) : (
    <center>
      <p className="kame_font_002 my-5">Please access from a smartphone.</p>
      <svg
        xmlns="http://www.w3.org/2  0 00/svg"
        width="132"
        height="132"
        fill="currentColor"
        class="bi bi-phone"
        viewBox="0 0 16 16"
      >
        <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z" />
        <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
      </svg>
    </center>
  );
}

function createCarousel(imageUrls) {
  const carouselIndicator = document.querySelector(".carousel-indicators");
  const carouselInner = document.querySelector(".carousel-inner");

  // Clear previous items
  carouselIndicator.innerHTML = "";
  carouselInner.innerHTML = "";

  imageUrls.forEach((url, index) => {
    // Add carousel indicators
    const indicatorButton = document.createElement("button");
    indicatorButton.setAttribute("type", "button");
    indicatorButton.setAttribute("data-bs-target", "#carouselExampleDark");
    indicatorButton.setAttribute("data-bs-slide-to", index);
    indicatorButton.setAttribute("aria-label", `Slide ${index + 1}`);
    if (index === 0) {
      indicatorButton.classList.add("active");
      indicatorButton.setAttribute("aria-current", "true");
    }
    carouselIndicator.appendChild(indicatorButton);

    // Add carousel items
    const carouselItem = document.createElement("div");
    carouselItem.classList.add("carousel-item");
    if (index === 0) carouselItem.classList.add("active");

    const img = document.createElement("img");
    img.src = url;
    img.classList.add("d-block", "w-100");
    img.alt = `Slide ${index + 1}`;

    const caption = document.createElement("div");
    caption.classList.add("carousel-caption", "d-none", "d-md-block");
    const h5 = document.createElement("h5");
    h5.innerText = `Slide ${index + 1} label`;
    const p = document.createElement("p");
    p.innerText = `Some representative placeholder content for slide ${index + 1
      }.`;

    caption.appendChild(h5);
    caption.appendChild(p);
    carouselItem.appendChild(img);
    carouselItem.appendChild(caption);

    carouselInner.appendChild(carouselItem);
  });
}

export default HomePage;
