import React, { useState, useEffect } from "react";
import { doc, setDoc, collection, getDocs, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Footer, Header } from "../PageParts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Page, PageHero } from "../components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
const timeSlots = ["朝練", "１限", "チャペル", "２限", "昼練", "３限", "４限", "５限", "夜練Ⅰ", "夜練Ⅱ"];

function CreateReservationSettings() {
  const [selectedSlots, setSelectedSlots] = useState({});
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    const fetchTemplates = async () => {
      const templatesSnapshot = await getDocs(collection(db, "ReservationTemplate"));
      const templatesList = templatesSnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setTemplates(templatesList);
    };

    fetchTemplates();
  }, []);

  const handleCellClick = (day, timeSlot) => {
    const key = `${day}_${timeSlot}`;
    setSelectedSlots((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleSaveSettings = async () => {
    if (!selectedTemplate) {
      alert("テンプレートを選択してください。");
      return;
    }

    const settingsData = {};

    Object.keys(selectedSlots).forEach((key) => {
      if (selectedSlots[key]) {
        const [day, timeSlot] = key.split("_");
        if (!settingsData[day]) {
          settingsData[day] = [];
        }
        settingsData[day].push(timeSlot);
      }
    });

    await Promise.all(
      Object.keys(settingsData).map(async (day) => {
        const docRef = doc(db, "ReservationSchedules", day);
        const existingDoc = await getDoc(docRef);
        const newReservation = {
          TemplateID: selectedTemplate,
          TimeSlots: settingsData[day],
        };

        if (existingDoc.exists()) {
          const existingData = existingDoc.data();
          const updatedReservations = existingData.Reservations || [];
          const updatedData = updatedReservations.filter(
            (res) => res.TemplateID !== selectedTemplate
          );
          updatedData.push(newReservation);

          await setDoc(
            docRef,
            {
              Reservations: updatedData,
            },
            { merge: true }
          );
        } else {
          await setDoc(docRef, {
            Reservations: [newReservation],
          });
        }
      })
    );

    alert("予約設定が保存されました。");
  };

  return (
    <>
      <Header />
      <Page>
        <PageHero eyebrow="Admin" title="緊急予約設定" description="テンプレートを選び、曜日と時間帯の組み合わせに一括で割り当てます。" />
        <Card>
          <CardHeader>
            <CardTitle>予約スロット設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <select
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">-- テンプレートを選択 --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.Category} - {template.NickName}
                </option>
              ))}
            </select>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time Slot</TableHead>
                  {weekDays.map((day) => (
                    <TableHead key={day}>{day}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots.map((timeSlot) => (
                  <TableRow key={timeSlot}>
                    <TableCell className="font-semibold">{timeSlot}</TableCell>
                    {weekDays.map((day) => {
                      const key = `${day}_${timeSlot}`;
                      const selected = selectedSlots[key];
                      return (
                        <TableCell key={key}>
                          <button
                            type="button"
                            onClick={() => handleCellClick(day, timeSlot)}
                            className={`w-full rounded-2xl px-3 py-2 text-sm font-semibold ${
                              selected
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {selected ? "★" : "○"}
                          </button>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button fullWidth onClick={handleSaveSettings}>
              Save Reservation Settings
            </Button>
          </CardContent>
        </Card>
      </Page>
      <Footer />
    </>
  );
}

export default CreateReservationSettings;
