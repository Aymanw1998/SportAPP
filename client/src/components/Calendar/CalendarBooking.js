import React, { useCallback, useEffect, useState } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // תצוגת חודש
import timeGridPlugin from "@fullcalendar/timegrid"; // תצוגת שבוע/יום
import listPlugin from "@fullcalendar/list"; // תצוגת רשימה
import interactionPlugin from "@fullcalendar/interaction"; // מאפשר גרירה ולחיצה
import heLocale from '@fullcalendar/core/locales/he'; // תמיכה בעברית
import moment from 'moment';
import 'moment/locale/he'; // ייבוא עברית ל-Moment.js
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import "./stylee.css"
import { apiService } from '../../api/apiService';
moment.locale('he'); // הגדרת עברית עבור Moment.js

const CalendarBooking = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]); // רשימת הפגישות
  useEffect(()=>console.log("events", events), [events]);
  const [blockedEvents,setBlockedEvents] = useState([]);
  useEffect(()=>console.log("blockedEvents", blockedEvents), [blockedEvents]);
  const [coaches, setCoaches] = useState([]); // רשימת המאמנים
  useEffect(()=>console.log("coaches", coaches), [coaches]);
  const [trainees, setTrainees] = useState([]); // רשימת המתאמנים
  useEffect(()=>console.log("trainees", trainees), [trainees]);
  const [showModal, setShowModal] = useState(false); // פתיחת מודאל
  useEffect(()=>console.log("showModal", showModal), [showModal]);
  const [currentEvent, setCurrentEvent] = useState(null); // פגישה שנבחרה
  useEffect(()=>console.log("currentEvent", currentEvent), [currentEvent]);
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    coachId: "",
    maximum: 2,
    isGroup: false,
    traineesId: [],
  });
  const [dateS, setDateS] = useState();
  const [goodS, setGoodS] = useState(true); 
  const [dateE, setDateE] = useState();
  const [goodE, setGoodE] = useState(true);
  const checkOverlap = (selectedStart, selectedEnd, existingEvents) => {
    // console.log("strat", selectedStart);
    // console.log("end", selectedEnd);
    // console.log("list", existingEvents);
    // // בודק אם הפגישה שנבחרה חופפת לפגישה קיימת
    return existingEvents.some((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        
        // חפיפות אם הפגישה שנבחרה מתחילה או מסתיימת במהלך פגישה קיימת
        return (selectedStart < eventEnd && selectedEnd > eventStart);
    });
};
  useEffect(()=>{
     console.log("formData", formData)
    }, [formData]);
  
  const fetchData = async () => {
    if(!localStorage.getItem('token')) return;
    console.log("start fetchData")
    setIsLoading(true); // התחלת טעינה
    
    await apiService.delete(`/appointments/`);

      let eventsRes = null, coachesRes = null, traineesRes = null, myCoachEventRes = null;
      if(localStorage.getItem('role') === "coach"){
        try{
          eventsRes = await apiService.get("/appointments/my");
        }catch (err) {
          console.error("Error fetching data:", err);
        }
        try{
          coachesRes = await apiService.get("/auth/me");
        } catch (err) {
          console.error("Error fetching data:", err);
        }
        try{
          traineesRes = await apiService.get("/auth/myTrainee")
        } catch (err) {
          console.error("Error fetching data:", err);
        }
        console.log("fetchData ",eventsRes.data, coachesRes.data, traineesRes.data)
        setEvents(
          eventsRes.data.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            maximum: Number(event.maximum || 2),
            isGroup: Boolean(event.isGroup || false),
          }))
        );
      
        setCoaches(coachesRes ? [coachesRes.data] : []);
        setTrainees(traineesRes ? traineesRes.data : null);
        setFormData(coachesRes ? { ...formData, coachId: coachesRes?.data?._id } : {...formData})
      }else{
        
        try{
          eventsRes = await apiService.get("/appointments/my");
        }catch (err) {
          console.error("Error fetching data:", err);
        }
        try{
          coachesRes = await apiService.get("/auth/myCoach");
        } catch (err) {
          console.error("Error fetching data:", err);
        }
        try{
          traineesRes = await apiService.get("/auth/me")
        } catch (err) {
          console.error("Error fetching data:", err);
        }
        try{
          myCoachEventRes = await apiService.get("/appointments/myCoachEvent")
        } catch (err) {
          console.error("Error fetching data:", err);
        }
        
        setEvents(
          eventsRes.data.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            maximum: Number(event.maximum || 2),
            isGroup: Boolean(event.isGroup || false),  
          }))
        );
        // console.log("myCoachEventRes", myCoachEventRes.data);
        const myCoachEvents = myCoachEventRes ? myCoachEventRes.data : null;
        setCoaches(coachesRes ? coachesRes.data : null);
        setTrainees(traineesRes ? [traineesRes.data] : []);
        setFormData({ ...formData, coachId: coachesRes?.data[0]._id, traineesId: [traineesRes?.data?._id] })
        if(localStorage.getItem('id'))
          setBlockedEvents(myCoachEventRes && myCoachEvents.filter((e)=> !e.traineesId.includes(localStorage.getItem('id'))).map(event=> ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            maximum: Number(event.maximum || 1),
            isGroup: Boolean(event.isGroup || false), 
          })
        ))
        else setBlockedEvents(myCoachEventRes.map(event=>({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          maximum: Number(event.maximum || 1),
          isGroup: Boolean(event.isGroup || false),
        })));
      }
      setIsLoading(false); // התחלת טעינ
  };
   // שליפת נתונים מהשרת
useEffect(() => {fetchData();}, []);

  const openModal = (event = null) => {
    console.log("for openModal", event)
    setGoodS(true); setGoodE(true);
    setDateS(formatDate(moment(event.start)));
    setDateE(formatDate(moment(event.end)));
    //console.log("event exist", event)
    if ("title" in event && "coachId" in event && "traineesId" in event) {
      if(localStorage.getItem("role") === "trainee" && !event.traineesId.includes(localStorage.getItem("id")))
        return alert("הזמן הזה חסום");
      setCurrentEvent(event); // פגישה קיימת לעריכה
      setFormData({
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        coachId: event.coachId,
        traineesId: event.traineesId,
      });
    } else {
      if(checkOverlap(new Date(event.start), new Date(event.end), [...blockedEvents, ...events])) return;
      setCurrentEvent(null); // פגישה חדשה
      setFormData({
        ...formData,
        title: "",
        start: new Date(event.start),
        end: new Date(event.end),
        maximum: Number(event.maximum || 2),
        traineesId: [],
        isGroup: false,
      });
    }
    setShowModal(true);
  }
  
  const closeModal = async() => {
    setShowModal(false);
    await fetchData();
  };

  const saveEvent = async (info=null) => {
    console.log(info);
    let start = dateS;
    let end = dateE;

    console.log(start, end);
    const dateSS = {
      year:  start.split(" ")[0].split("/")[2],
      month: start.split(" ")[0].split("/")[1],
      day: start.split(" ")[0].split("/")[0],
      hour: start.split(" ")[1].split(":")[0],
      minutes: start.split(" ")[1].split(":")[1],
    } 
    const dateEE = {
      year:  end.split(" ")[0].split("/")[2],
      month: end.split(" ")[0].split("/")[1],
      day: end.split(" ")[0].split("/")[0],
      hour: end.split(" ")[1].split(":")[0],
      minutes: end.split(" ")[1].split(":")[1],
    } 
    console.log(dateSS, dateEE);
    setIsLoading(true); // סיום טעינה
    console.log("currentEvent",currentEvent)
    try {
      if (currentEvent) {
        console.log("update event", currentEvent, formData)
        const res = await apiService.put(`/appointments/${currentEvent._id}`, {
          ...formData,
          start: new Date(dateSS.year, dateSS.month -1, dateSS.day, dateSS.hour, dateSS.minutes),
          end: new Date(dateEE.year, dateEE.month -1, dateEE.day, dateEE.hour, dateEE.minutes),
          maximum: Number(formData.maximum || 2),
          isGroup: Boolean(formData.isGroup || false),
        });
        const eventObj = {
          ...res.data,
          start: new Date(res.data.start),
          end: new Date(res.data.end),
          maximum: Number(res.data.maximum || 2),
          isGroup: Boolean(res.data.isGroup || false),
        }
        setEvents(events.map((e) => (e._id === currentEvent._id ? eventObj : e)));
      } else {
        //console.log("save event",formData);
        // יצירת פגישה חדשה
        if(checkOverlap(new Date(formData.start), new Date(formData.end), [...blockedEvents, ...events])){
          return alert("הזמן הנבחר חופף לאימון אחר");
        }
        alert(formData.title, formData.start, formData.end)
        const res = await apiService.post("/appointments/", {
          ...formData,
          start: new Date(dateSS.year, dateSS.month -1, dateSS.day, dateSS.hour, dateSS.minutes),
          end: new Date(dateEE.year, dateEE.month -1, dateEE.day, dateEE.hour, dateEE.minutes),
          isGroup: Boolean(formData.isGroup || false),
          maximum: Number(formData.maximum || 2),
        });
      const eventObj = {
        ...res.data,
        start: new Date(res.data.start),
        end: new Date(res.data.end),
        maximum: Number(res.data.maximum || 2),
        isGroup: Boolean(res.data.isGroup || false),
      }
        setEvents([...events, eventObj]);
      }
    } catch (err) {
      console.error("Error saving event:", err);
      if(err.data?.messages === "Time slot is already taken")
        alert("באותו זמן המאמן יש לו שיעור עם מתאמנים אחרים")
      else alert("אירעה שגיאה בעת שמירת הנתונים. נסה שוב מאוחר יותר");
    } finally{
      // await apiService.delete(`/appointments/`);
      closeModal();
      setIsLoading(false); // סיום טעינה
    }
  };
  
  const deleteEvent = async () => {
    setIsLoading(true);
    try {
      await apiService.delete(`/appointments/${currentEvent._id}`);
      setEvents(events.filter((e) => e._id !== currentEvent._id));
      // closeModal();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Error deleting event");
    } finally {
      closeModal();
      fetchData();
      setIsLoading(false); // סיום טעינה
    }
    
  };

  
  const ee = [
    ...events.map(appt=>({
      ...appt,
      blocked: false,
    })),
    ...blockedEvents.map(appt=>({
      ...appt,
      blocked: true,
      rendering: "background",
      backgroundColor: "black", // צבע רקע שחור
      textColor: "black", // טקסט שחור
      display: "background", // מבטיח שהאירוע יוצג כרקע
    }))
  ]


  const formatDate = (d) => {
    const date = new Date(d);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // חודשים ב-JS מתחילים מ-0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  const getHeaderToolbar = () => {
    console.log("window.innerWidth", window.innerWidth)
    if (window.innerWidth <= 480) {
      // עבור מסכים קטנים (סמארטפונים)
      return {
        left: "prev,next",
        center: "title",
        right: "dayGridMonth,timeGridWeek",
      };
    } else if (window.innerWidth <= 768) {
      // עבור טאבלטים
      return {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      };
    } else {
      // עבור מסכים גדולים (מחשבים)
      return {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      };
    }
  };

  const [toolbarConfig, setToolbarConfig] = useState(getHeaderToolbar());

  useEffect(() => {
    const handleResize = () => {
      setToolbarConfig(getHeaderToolbar());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="App">
      {isLoading && <Spinner animation="border" />}
      <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
      initialView="timeGridWeek" // תצוגת שבוע כברירת מחדל
      locales={[heLocale]} // הגדרת שפה
      locale="he" // בחירת עברית כברירת מחדל
      direction="rtl" // מצב ימין-לשמאל
      selectable={true} 
      events={ee}
      height="auto"
      eventClick={({event, el}) => {openModal({...event._def.extendedProps, title: event._def.title, start: new Date(el.fcSeg.start).setHours(new Date(el.fcSeg.start).getHours() - 2), end: new Date(el.fcSeg.end).setHours(new Date(el.fcSeg.end).getHours() - 2) })}}
      eventDrop={({event, el}) => {saveEvent({...event._def.extendedProps, title: event._def.title, start: formatDate(new Date(el.fcSeg.start).setHours(new Date(el.fcSeg.start).getHours() - 2)), end: formatDate(new Date(el.fcSeg.end).setHours(new Date(el.fcSeg.end).getHours() - 2)) })}} // גרירת אירוע ושמירת תאריך חדש
      select={({ start, end }) => openModal({ start, end })}
      headerToolbar={toolbarConfig}
      slotLabelFormat={{
        hour: "2-digit",
        minute: "2-digit",
        omitZeroMinute: false,
        meridiem: false,
      }}
      eventTimeFormat={{
        hour: "2-digit",
        minute: "2-digit",
        meridiem: false,
      }}
      firstDay={0} // ראשון כתחילת השבוע
      dayHeaderFormat={{ weekday: "long", day: "numeric" }} // ראשון 15
      slotMinTime="05:00:00" // שעת התחלה מינימלית 05:00
      slotMaxTime="22:00:00" // שעת סיום מקסימלית 22:00
      nowIndicator={true} // קו זמן נוכחי
    />


  
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentEvent ? "ערוך פגישה" : "הוסף פגישה"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <h1>{formatDate(formData.start)}</h1>
            <Form.Group controlId="formTitle">
              <Form.Label>כותרת</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>
            
            <Form.Group controlId="formStart">
              <Form.Label>תאריך התחלה</Form.Label>
              <br></br>
              <div dir="ltr">
              <input type='text' dir="ltr" value={dateS} style={{outline: goodS? "2px solid" : "2px solid red" }} onChange={(e)=> {
                setDateS(e.target.value)
                if(moment(e.target.value, "DD/MM/YYYY HH:mm", true).isValid()){
                  console.log("yes",e.target.value);
                  setGoodS(true)
                }
                else{
                  console.log("no")
                  setGoodS(false)
                }
              }}/>
              <span>dd/mm/yyyy HH:mm</span>
              </div>
            </Form.Group>
            <Form.Group controlId="formStart">
              <Form.Label>תאריך סיום</Form.Label>
              <br></br>
              <div dir="ltr"> 
                <input type='text' dir="ltr" style={{outline: goodE? "2px solid" : "2px solid red" }} value={dateE} onChange={(e)=> {
                  setDateE(e.target.value)
                  if(moment(e.target.value, "DD/MM/YYYY HH:mm", true).isValid()){
                    console.log("yes",e.target.value);
                    setGoodE(true)
                  }
                  else{
                    console.log("no")
                    setGoodE(false)
                  }
                }}/>
              <span>dd/mm/yyyy HH:mm</span>
              </div>
            </Form.Group>

            {localStorage.getItem("role") === "coach" &&
            <Form.Group controlId="formTrainee">
              {/* <Form.Check // prettier-ignore
                type="switch"
                id="custom-switch"
                label="פגישה קבוצתית"
                checked={formData.isGroup}
                onChange={()=>{setFormData({...formData,maximum: 2, isGroup: !formData.isGroup});}}
              /> */}
              <Form.Label>מתאמן</Form.Label><br/>
              {formData.isGroup && <span>בחר כמות מקסימאלית של משתתפים</span>}
              {formData.isGroup && <input type='number' min={2} max={10} value={formData.maximum} onChange={(e)=>{setFormData({...formData,maximum: e.target.value})}}/>}
              {formData.isGroup?<Form.Control
                as="select"
                value={formData.traineesId}
                onChange={(e) => setFormData({ ...formData, traineesId: [].slice.call(e.target.selectedOptions).map(item => item.value) })}
              >
                
                <option value="">בחר מתאמן</option>
                {trainees.length > 0 && trainees.map((trainee) => (
                  <option key={trainee._id} value={trainee._id}>
                    {trainee.username}
                  </option>
                ))}
              </Form.Control>:
              <Form.Control
                as="select"
                value={formData.traineesId}
                onChange={(e) => setFormData({ ...formData, traineesId: [].slice.call(e.target.selectedOptions).map(item => item.value) })}
              >
                
                <option value="">בחר מתאמן</option>
                {trainees.length > 0 && trainees.map((trainee) => (
                  <option key={trainee._id} value={trainee._id}>
                    {trainee.username}
                  </option>
                ))}
              </Form.Control>}
            </Form.Group>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {currentEvent && (
            <Button variant="danger" onClick={deleteEvent}>
              מחק
            </Button>
          )}
          <Button variant="secondary" onClick={closeModal}>
            סגור
          </Button>
          <Button variant="primary" onClick={saveEvent}>
            שמור
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
  
};



export default CalendarBooking;


// import React, { useCallback, useEffect, useState } from 'react';
// import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
// import format from 'date-fns/format';
// import parse from 'date-fns/parse';
// import startOfWeek from "date-fns/startOfWeek";
// import getDay from 'date-fns/getDay';
// import moment from 'moment';
// import he from 'date-fns/locale/he'; // ייבוא עברית
// import 'moment/locale/he'; // ייבוא עברית ל-Moment.js

// import { Modal, Button, Form, Spinner } from "react-bootstrap";

// import { apiService } from '../../api/apiService';
// moment.locale('he'); // הגדרת עברית עבור Moment.js

// const locales = {
//   he,
// };
// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek,
//   getDay,
//   locales,
// });
// const messages = {
//   next: "הבא",
//   previous: "הקודם",
//   today: "היום",
//   month: "חודש",
//   week: "שבוע",
//   day: "יום",
//   date: "תאריך",
//   time: "שעה",
//   event: "אירוע",
//   noEventsInRange: "אין אירועים בטווח הזה",
//   allDay: "כל היום",
//   showMore: (count) => `+ עוד ${count}`,
// };
// // שינוי פורמט שם התאריך
// const customMessages = {
//   ...messages,
// };
// const CalendarBooking = () => {

//   const [isLoading, setIsLoading] = useState(false);
//   const [events, setEvents] = useState([]); // רשימת הפגישות
//   useEffect(()=>console.log("events", events), [events]);
//   const [blockedEvents,setBlockedEvents] = useState([]);
//   useEffect(()=>console.log("blockedEvents", blockedEvents), [blockedEvents]);
//   const [coaches, setCoaches] = useState([]); // רשימת המאמנים
//   useEffect(()=>console.log("coaches", coaches), [coaches]);
//   const [trainees, setTrainees] = useState([]); // רשימת המתאמנים
//   useEffect(()=>console.log("trainees", trainees), [trainees]);
//   const [showModal, setShowModal] = useState(false); // פתיחת מודאל
//   useEffect(()=>console.log("showModal", showModal), [showModal]);
//   const [currentEvent, setCurrentEvent] = useState(null); // פגישה שנבחרה
//   useEffect(()=>console.log("currentEvent", currentEvent), [currentEvent]);
//   const [formData, setFormData] = useState({
//     title: "",
//     start: "",
//     end: "",
//     coachId: "",
//     maximum: 2,
//     isGroup: false,
//     traineesId: [],
//   });
//   const [dateS, setDateS] = useState();
//   const [goodS, setGoodS] = useState(true); 
//   const [dateE, setDateE] = useState();
//   const [goodE, setGoodE] = useState(true);
//   const checkOverlap = (selectedStart, selectedEnd, existingEvents) => {
//     // console.log("strat", selectedStart);
//     // console.log("end", selectedEnd);
//     // console.log("list", existingEvents);
//     // // בודק אם הפגישה שנבחרה חופפת לפגישה קיימת
//     return existingEvents.some((event) => {
//         const eventStart = new Date(event.start);
//         const eventEnd = new Date(event.end);
        
//         // חפיפות אם הפגישה שנבחרה מתחילה או מסתיימת במהלך פגישה קיימת
//         return (selectedStart < eventEnd && selectedEnd > eventStart);
//     });
// };
//   useEffect(()=>{
//      console.log("formData", formData)
//     }, [formData]);
  
//   const fetchData = async () => {
//     if(!localStorage.getItem('token')) return;
//     console.log("start fetchData")
//     setIsLoading(true); // התחלת טעינה
    
//     await apiService.delete(`/appointments/`);

//       let eventsRes = null, coachesRes = null, traineesRes = null, myCoachEventRes = null;
//       if(localStorage.getItem('role') === "coach"){
//         try{
//           eventsRes = await apiService.get("/appointments/my");
//         }catch (err) {
//           console.error("Error fetching data:", err);
//         }
//         try{
//           coachesRes = await apiService.get("/auth/me");
//         } catch (err) {
//           console.error("Error fetching data:", err);
//         }
//         try{
//           traineesRes = await apiService.get("/auth/myTrainee")
//         } catch (err) {
//           console.error("Error fetching data:", err);
//         }
//         console.log("fetchData ",eventsRes.data, coachesRes.data, traineesRes.data)
//         setEvents(
//           eventsRes.data.map(event => ({
//             ...event,
//             start: new Date(event.start),
//             end: new Date(event.end),
//             maximum: Number(event.maximum || 2),
//             isGroup: Boolean(event.isGroup || false),
//           }))
//         );
      
//         setCoaches(coachesRes ? [coachesRes.data] : []);
//         setTrainees(traineesRes ? traineesRes.data : null);
//         setFormData(coachesRes ? { ...formData, coachId: coachesRes?.data?._id } : {...formData})
//       }else{
        
//         try{
//           eventsRes = await apiService.get("/appointments/my");
//         }catch (err) {
//           console.error("Error fetching data:", err);
//         }
//         try{
//           coachesRes = await apiService.get("/auth/myCoach");
//         } catch (err) {
//           console.error("Error fetching data:", err);
//         }
//         try{
//           traineesRes = await apiService.get("/auth/me")
//         } catch (err) {
//           console.error("Error fetching data:", err);
//         }
//         try{
//           myCoachEventRes = await apiService.get("/appointments/myCoachEvent")
//         } catch (err) {
//           console.error("Error fetching data:", err);
//         }
        
//         setEvents(
//           eventsRes.data.map(event => ({
//             ...event,
//             start: new Date(event.start),
//             end: new Date(event.end),
//             maximum: Number(event.maximum || 2),
//             isGroup: Boolean(event.isGroup || false),  
//           }))
//         );
//         // console.log("myCoachEventRes", myCoachEventRes.data);
//         const myCoachEvents = myCoachEventRes ? myCoachEventRes.data : null;
//         setCoaches(coachesRes ? coachesRes.data : null);
//         setTrainees(traineesRes ? [traineesRes.data] : []);
//         setFormData({ ...formData, coachId: coachesRes?.data[0]._id, traineesId: [traineesRes?.data?._id] })
//         if(localStorage.getItem('id'))
//           setBlockedEvents(myCoachEventRes && myCoachEvents.filter((e)=> !e.traineesId.includes(localStorage.getItem('id'))).map(event=> ({
//             ...event,
//             start: new Date(event.start),
//             end: new Date(event.end),
//             maximum: Number(event.maximum || 1),
//             isGroup: Boolean(event.isGroup || false), 
//           })
//         ))
//         else setBlockedEvents(myCoachEventRes.map(event=>({
//           ...event,
//           start: new Date(event.start),
//           end: new Date(event.end),
//           maximum: Number(event.maximum || 1),
//           isGroup: Boolean(event.isGroup || false),
//         })));
//       }
//       setIsLoading(false); // התחלת טעינ
//   };
//    // שליפת נתונים מהשרת
// useEffect(() => {fetchData();}, []);

//   const openModal = (event = null) => {
//     console.log("for openModal", event, events)
//     setGoodS(true); setGoodE(true);
//     setDateS(formatDate(moment(event.start)));
//     setDateE(formatDate(moment(event.end)));
//     //console.log("event exist", event)
//     if ("title" in event && "coachId" in event && "traineesId" in event) {
//       if(localStorage.getItem("role") === "trainee" && !event.traineesId.includes(localStorage.getItem("id")))
//         return alert("הזמן הזה חסום");
//       setCurrentEvent(event); // פגישה קיימת לעריכה
//       setFormData({
//         title: event.title,
//         start: new Date(event.start),
//         end: new Date(event.end),
//         coachId: event.coachId,
//         traineesId: event.traineesId,
//       });
//     } else {
//       if(checkOverlap(new Date(event.start), new Date(event.end), [...blockedEvents, ...events])) return;
//       setCurrentEvent(null); // פגישה חדשה
//       setFormData({
//         ...formData,
//         title: "",
//         start: new Date(event.start),
//         end: new Date(event.end),
//         maximum: Number(event.maximum || 2),
//         traineesId: [],
//         isGroup: false,
//       });
//     }
//     setShowModal(true);
//   }
  
//   const closeModal = async() => {
//     setShowModal(false);
//     await fetchData();
//   };

//   const saveEvent = async () => {
//     const dateSS = {
//       year:  dateS.split(" ")[0].split("/")[2],
//       month: dateS.split(" ")[0].split("/")[1],
//       day: dateS.split(" ")[0].split("/")[0],
//       hour: dateS.split(" ")[1].split(":")[0],
//       minutes: dateS.split(" ")[1].split(":")[1],
//     } 
//     const dateEE = {
//       year:  dateE.split(" ")[0].split("/")[2],
//       month: dateE.split(" ")[0].split("/")[1],
//       day: dateE.split(" ")[0].split("/")[0],
//       hour: dateE.split(" ")[1].split(":")[0],
//       minutes: dateE.split(" ")[1].split(":")[1],
//     } 
//     setIsLoading(true); // סיום טעינה
//     console.log("currentEvent",currentEvent)
//     try {
//       if (currentEvent) {
//         console.log("update event", currentEvent, formData)
//         const res = await apiService.put(`/appointments/${currentEvent._id}`, {
//           ...formData,
//           start: new Date(dateSS.year, dateSS.month -1, dateSS.day, dateSS.hour, dateSS.minutes),
//           end: new Date(dateEE.year, dateEE.month -1, dateEE.day, dateEE.hour, dateEE.minutes),
//           maximum: Number(formData.maximum || 2),
//           isGroup: Boolean(formData.isGroup || false),
//         });
//         const eventObj = {
//           ...res.data,
//           start: new Date(res.data.start),
//           end: new Date(res.data.end),
//           maximum: Number(res.data.maximum || 2),
//           isGroup: Boolean(res.data.isGroup || false),
//         }
//         setEvents(events.map((e) => (e._id === currentEvent._id ? eventObj : e)));
//       } else {
//         //console.log("save event",formData);
//         // יצירת פגישה חדשה
//         if(checkOverlap(new Date(formData.start), new Date(formData.end), [...blockedEvents, ...events])){
//           return alert("הזמן הנבחר חופף לאימון אחר");
//         }
//         alert(formData.title, formData.start, formData.end)
//         const res = await apiService.post("/appointments/", {
//           ...formData,
//           start: new Date(dateSS.year, dateSS.month -1, dateSS.day, dateSS.hour, dateSS.minutes),
//           end: new Date(dateEE.year, dateEE.month -1, dateEE.day, dateEE.hour, dateEE.minutes),
//           isGroup: Boolean(formData.isGroup || false),
//           maximum: Number(formData.maximum || 2),
//         });
//       const eventObj = {
//         ...res.data,
//         start: new Date(res.data.start),
//         end: new Date(res.data.end),
//         maximum: Number(res.data.maximum || 2),
//         isGroup: Boolean(res.data.isGroup || false),
//       }
//         setEvents([...events, eventObj]);
//       }
//     } catch (err) {
//       console.error("Error saving event:", err);
//       if(err.data?.messages === "Time slot is already taken")
//         alert("באותו זמן המאמן יש לו שיעור עם מתאמנים אחרים")
//       else alert("אירעה שגיאה בעת שמירת הנתונים. נסה שוב מאוחר יותר");
//     } finally{
//       // await apiService.delete(`/appointments/`);
//       closeModal();
//       setIsLoading(false); // סיום טעינה
//     }
//   };
  
//   const deleteEvent = async () => {
//     setIsLoading(true);
//     try {
//       await apiService.delete(`/appointments/${currentEvent._id}`);
//       setEvents(events.filter((e) => e._id !== currentEvent._id));
//       // closeModal();
//     } catch (err) {
//       console.error("Error deleting event:", err);
//       alert("Error deleting event");
//     } finally {
//       closeModal();
//       fetchData();
//       setIsLoading(false); // סיום טעינה
//     }
    
//   };

//   const eventPropGetter = (event) => {
//     const isBlocked = blockedEvents.some(
//         (blockedEvent) =>
//             event.start.getTime() >= blockedEvent.start && event.end.getTime() <= blockedEvent.end
//     );

//     const style = {
//         backgroundColor: isBlocked ? 'black' : '#007bff', // צבע אדום לפגישות חסומות
//         color: isBlocked ? 'black' : 'white',
//         borderRadius: '5px',
//         border: 'none',
//         padding: '5px',
//     };

//     return { style };
// };


//   const ee = [
//     ...events.map(appt=>({
//       ...appt,
//       blocked: false,
//     })),
//     ...blockedEvents.map(appt=>({
//       ...appt,
//       blocked: false,
//     }))
//   ]


//   const formatDate = (d) => {
//     const date = new Date(d);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0"); // חודשים ב-JS מתחילים מ-0
//     const year = date.getFullYear();
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");

//     return `${day}/${month}/${year} ${hours}:${minutes}`;
//   }

//   return (
//     <div className="App">
//       {isLoading && <Spinner animation="border" />}
//       <Calendar
//         localizer={localizer}
//         events={ee}
//         tooltipAccessor={(e) => e.title}
//         startAccessor="start"
//         endAccessor="end"
//         defaultView="week"
//         views={["month", "week", "day"]} // אין תצוגת "agenda"
//         style={{ height: 1000, margin: "50px" }}
//         selectable
//         showMultiDayTimes ={true}
//         // rtl={true} // הפעלת מצב ימין-לשמאל
//         onSelectSlot={(slotInfo) =>
//           openModal({ start: slotInfo.start, end: slotInfo.end })
//         }onSelectEvent={(event) => openModal(event)}
//         min={new Date(new Date().setHours(5, 0, 0))} // 08:00
//         // max={new Date(new Date().setHours(, 0, 0))} // 22:00
//         eventPropGetter={eventPropGetter} // עיצוב מותאם אישית
//         components={{
//           event: ({ event }) => (
//               <span>
//                   {event.title} 
//               </span>
//           )
//       }}
//         messages={customMessages} // הגדרות עברית ללוח השנה
//         formats={{
//           dateFormat: "d", // מספר היום בלבד
//           dayFormat: (date) => moment(date).format("ddd DD/MM"), // א, ב, ג...
//           weekdayFormat: (date) => moment(date).format("dddd"), // ראשון, שני...
//           monthHeaderFormat: (date) => moment(date).format("MMMM YYYY"), // ינואר 2024
//           // weekHeaderFormat: (date) => moment(date).format("DD MMMM YYYY"),//`${moment(start).format("D MMMM")} - ${moment(end).format("D MMMM")}`, // טווח שבועי בעברית        
//           weekHeaderFormat: ({ start, end }) => 
//             `${moment(start).format("D בMMMM")} - ${moment(end).format("D בMMMM YYYY")}`, // כותרת שבועית בעברית        
//           dayHeaderFormat: (date) => moment(date).format("dddd, DD/MM"), // ראשון, 15/01
//           timeGutterFormat: (date) => moment(date).format("HH:mm"), // שעות בציר הזמן
//           eventTimeRangeFormat: ({start, end, event }) => `${moment(start).format("HH:mm")} - ${moment(end).format("HH:mm")}`, // טווח שעות באירוע
//           eventTimeRangeStartFormat: (start) => moment(start).format("HH:mm"), // שעת התחלה
//           eventTimeRangeEndFormat: (end) => moment(end).format("HH:mm"), // שעת סיום
//       }}

//       />
  
//       <Modal show={showModal} onHide={closeModal}>
//         <Modal.Header closeButton>
//           <Modal.Title>{currentEvent ? "ערוך פגישה" : "הוסף פגישה"}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <h1>{formatDate(formData.start)}</h1>
//             <Form.Group controlId="formTitle">
//               <Form.Label>כותרת</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               />
//             </Form.Group>
            
//             <Form.Group controlId="formStart">
//               <Form.Label>תאריך התחלה</Form.Label>
//               <br></br>
//               <div dir="ltr">
//               <input type='text' dir="ltr" value={dateS} style={{outline: goodS? "2px solid" : "2px solid red" }} onChange={(e)=> {
//                 setDateS(e.target.value)
//                 if(moment(e.target.value, "DD/MM/YYYY HH:mm", true).isValid()){
//                   console.log("yes",e.target.value);
//                   setGoodS(true)
//                 }
//                 else{
//                   console.log("no")
//                   setGoodS(false)
//                 }
//               }}/>
//               <span>dd/mm/yyyy HH:mm</span>
//               </div>
//             </Form.Group>
//             <Form.Group controlId="formStart">
//               <Form.Label>תאריך סיום</Form.Label>
//               <br></br>
//               <div dir="ltr"> 
//                 <input type='text' dir="ltr" style={{outline: goodE? "2px solid" : "2px solid red" }} value={dateE} onChange={(e)=> {
//                   setDateE(e.target.value)
//                   if(moment(e.target.value, "DD/MM/YYYY HH:mm", true).isValid()){
//                     console.log("yes",e.target.value);
//                     setGoodE(true)
//                   }
//                   else{
//                     console.log("no")
//                     setGoodE(false)
//                   }
//                 }}/>
//               <span>dd/mm/yyyy HH:mm</span>
//               </div>
//             </Form.Group>

//             {localStorage.getItem("role") === "coach" &&
//             <Form.Group controlId="formTrainee">
//               {/* <Form.Check // prettier-ignore
//                 type="switch"
//                 id="custom-switch"
//                 label="פגישה קבוצתית"
//                 checked={formData.isGroup}
//                 onChange={()=>{setFormData({...formData,maximum: 2, isGroup: !formData.isGroup});}}
//               /> */}
//               <Form.Label>מתאמן</Form.Label><br/>
//               {formData.isGroup && <span>בחר כמות מקסימאלית של משתתפים</span>}
//               {formData.isGroup && <input type='number' min={2} max={10} value={formData.maximum} onChange={(e)=>{setFormData({...formData,maximum: e.target.value})}}/>}
//               {formData.isGroup?<Form.Control
//                 as="select"
//                 multiple
//                 value={formData.traineesId}
//                 onChange={(e) => setFormData({ ...formData, traineesId: [].slice.call(e.target.selectedOptions).map(item => item.value) })}
//               >
                
//                 <option value="">בחר מתאמן</option>
//                 {trainees.length > 0 && trainees.map((trainee) => (
//                   <option key={trainee._id} value={trainee._id}>
//                     {trainee.username}
//                   </option>
//                 ))}
//               </Form.Control>:
//               <Form.Control
//                 as="select"
//                 value={formData.traineesId}
//                 onChange={(e) => setFormData({ ...formData, traineesId: [].slice.call(e.target.selectedOptions).map(item => item.value) })}
//               >
                
//                 <option value="">בחר מתאמן</option>
//                 {trainees.length > 0 && trainees.map((trainee) => (
//                   <option key={trainee._id} value={trainee._id}>
//                     {trainee.username}
//                   </option>
//                 ))}
//               </Form.Control>}
//             </Form.Group>}
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           {currentEvent && (
//             <Button variant="danger" onClick={deleteEvent}>
//               מחק
//             </Button>
//           )}
//           <Button variant="secondary" onClick={closeModal}>
//             סגור
//           </Button>
//           <Button variant="primary" onClick={saveEvent}>
//             שמור
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
  
// };



// export default CalendarBooking;
