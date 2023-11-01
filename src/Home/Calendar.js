import { useState, useEffect, useContext } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { Footer, Header } from "../PageParts";
import "../css/kame.css";
import { Link } from "react-router-dom";
import { InfoContext, ScheduleContext } from "../App";

const Calendar = (props) => {
    const [filePosts, setFilePosts] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const ScheduleInfo = useContext(ScheduleContext);

    useEffect(() => {
        const fetchFilePosts = async () => {
            const filePostsCollectionRef = collection(db, "Schedules");
            const q = query(filePostsCollectionRef, orderBy("__name__"));
            const filePostsSnapshot = await getDocs(q, { cache: "cached" });
            const filePostsData = filePostsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setFilePosts(filePostsData);
        };
        fetchFilePosts();
    }, []);

    const postCategory = ["kame_memo", "kame_exclamation", "kame_question", "kame_check"];

    const handleClick = (month) => {
        setCurrentMonth(month);
    };

    return (
        <>
            <Header />
            <center>
                <table>
                    <tr>
                        {Array.from({ length: 6 }, (_, i) => (<td><button className="kame_button_001" onClick={() => handleClick(i + 1)}>{i + 1}月</button></td>))}
                    </tr>
                    <tr>
                        {Array.from({ length: 6 }, (_, i) => (<td><button className="kame_button_001" onClick={() => handleClick(i + 7)}>{i + 7}月</button></td>))}
                    </tr>
                </table>
            </center>
            {filePosts
                .filter((filePost) => filePost.month === currentMonth)
                .map((filePost) => (
                    <div className={postCategory[filePost.category]} key={filePost.id}>
                        <table>
                            <tbody>
                                <tr>
                                    <div className="box-title">
                                        <td>
                                            {filePost.month}/{filePost.day}({filePost.dayofweek})&nbsp;&nbsp;&nbsp;&nbsp;
                                        </td>
                                        <td>
                                            <Link
                                                to="/scheduledetail"
                                                onClick={() => {
                                                    ScheduleInfo.Month = filePost.month;
                                                    ScheduleInfo.Date = filePost.day;
                                                    ScheduleInfo.Day = filePost.dayofweek;
                                                    ScheduleInfo.Title = filePost.title;
                                                    ScheduleInfo.Content = filePost.content;
                                                    ScheduleInfo.Link = filePost.link;
                                                    ScheduleInfo.Category = filePost.category
                                                }}
                                                style={{ color: "green" }}>
                                                {filePost.title}
                                            </Link>
                                        </td>
                                    </div>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                ))}
            <Footer />
        </>
    );
};

export default Calendar;
