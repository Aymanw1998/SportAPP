import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from "date-fns/startOfWeek";
import getDay from 'date-fns/getDay';
import moment from 'moment';
import he from 'date-fns/locale/he'; // ייבוא עברית
import 'moment/locale/he'; // ייבוא עברית ל-Moment.js

import { Modal, Button, Form, Spinner } from "react-bootstrap";

import { apiService } from '../../api/apiService';
import { Block } from '@mui/icons-material';

moment.locale('he'); // הגדרת עברית עבור Moment.js

const locales = {
  he,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
const messages = {
  next: "הבא",
  previous: "הקודם",
  today: "היום",
  month: "חודש",
  week: "שבוע",
  day: "יום",
  date: "תאריך",
  time: "שעה",
  event: "אירוע",
  noEventsInRange: "אין אירועים בטווח הזה",
  allDay: "כל היום",
  showMore: (count) => `+ עוד ${count}`,
};
// שינוי פורמט שם התאריך
const customMessages = {
  ...messages,
};
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

  const checkOverlap = (selectedStart, selectedEnd, existingEvents) => {
    console.log("strat", selectedStart);
    console.log("end", selectedEnd);
    console.log("list", existingEvents);
    // בודק אם הפגישה שנבחרה חופפת לפגישה קיימת
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
    setIsLoading(true); // התחלת טעינה
    try {
      if(localStorage.getItem('role') == "coach"){
      const [eventsRes, coachesRes, traineesRes] = await Promise.all([
        apiService.get("/appointments/my", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        apiService.get("/auth/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        apiService.get("/auth/myTrainee", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        ]);
      //console.log(eventsRes.data, coachesRes.data, traineesRes.data)
        setEvents(
          eventsRes.data.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            maximum: new Number(event.maximum || 2),
            isGroup: new Boolean(event.isGroup || false),
          }))
        );
      
        setCoaches([coachesRes.data]);
        setTrainees(traineesRes.data);
        setFormData({ ...formData, coachId: coachesRes?.data?._id })
      }else{
        const [eventsRes, coachesRes, traineesRes, myCoachEventRes] = await Promise.all([
          apiService.get("/appointments/my", {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          apiService.get("/auth/myCoach", {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          apiService.get("/auth/me", {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          apiService.get("/appointments/myCoachEvent", {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        
        setEvents(
          eventsRes.data.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            maximum: new Number(event.maximum || 2),
            isGroup: new Boolean(event.isGroup || false),  
          }))
        );
        console.log("myCoachEventRes", myCoachEventRes.data);
        const myCoachEvents = myCoachEventRes.data;
        setCoaches(coachesRes.data);
        setTrainees([traineesRes.data]);
        setFormData({ ...formData, coachId: coachesRes?.data[0]._id, traineesId: [traineesRes?.data?._id] })
        if(localStorage.getItem('id'))
          setBlockedEvents(myCoachEvents.filter((e)=> !e.traineesId.includes(localStorage.getItem('id'))).map(event=> ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            maximum: new Number(event.maximum || 1),
            isGroup: new Boolean(event.isGroup || false), 
          })
        ))
        else setBlockedEvents(myCoachEventRes.map(event=>({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          maximum: new Number(event.maximum || 1),
          isGroup: new Boolean(event.isGroup || false),
        })));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("אירעה שגיאה בעת שליפת הנתונים. נסה שוב מאוחר יותר");
    } finally {
      setIsLoading(false); // סיום טעינה
    }
  };
   // שליפת נתונים מהשרת
useEffect(() => {fetchData();}, []);

  const openModal = (event = null) => {
    //console.log("event exist", event)
    if ("title" in event && "coachId" in event && "traineesId" in event) {
      if(localStorage.getItem("role") == "trainee" && !event.traineesId.includes(localStorage.getItem("id")))
        return alert("הזמן הזה חסום");
      setCurrentEvent(event); // פגישה קיימת לעריכה
      setFormData({
        title: event.title,
        start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
        end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
        coachId: event.coachId,
        traineesId: event.traineesId,
      });
    } else {
      setCurrentEvent(null); // פגישה חדשה
      setFormData({
        ...formData,
        title: "",
        start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
        end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
        maximum: new Number(event.maximum || 2),
        isGroup: false,
      });
    }
    setShowModal(true);
  }
  
  const closeModal = async() => {
    setShowModal(false);
    await fetchData();
  };

  const saveEvent = async () => {
    setIsLoading(true); // סיום טעינה
    try {
      if (currentEvent) {
        // עדכון פגישה קיימת
        console.log("sssss", formData)
        if(formData._id != currentEvent._id && checkOverlap(new Date(formData.start), new Date(formData.end), [...blockedEvents, ...events])){
          return alert("הזמן הנבחר חופף לאימון אחר");
        }
        const res = await apiService.put(`/appointments/${currentEvent._id}`, {
          ...formData,
          start: new Date(formData.start),
          end: new Date(formData.end),
          maximum: new Number(formData.maximum || 2),
          isGroup: new Boolean(formData.isGroup || false),
        },{
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
        const eventObj = {
          ...res.data,
          start: new Date(res.data.start),
          end: new Date(res.data.end),
          maximum: new Number(res.data.maximum || 2),
          isGroup: new Boolean(res.data.isGroup || false),
        }
        console.log("res.data",res.data)
        setEvents(events.map((e) => (e._id === currentEvent._id ? eventObj : e)));
      } else {
        //console.log("save event",formData);
        // יצירת פגישה חדשה
        if(checkOverlap(new Date(formData.start), new Date(formData.end), [...blockedEvents, ...events])){
          return alert("הזמן הנבחר חופף לאימון אחר");
        }
        const res = await apiService.post("/appointments/", {
          ...formData,
          start: new Date(formData.start),
          end: new Date(formData.end),
          isGroup: new Boolean(formData.isGroup || false),
          maximum: new Number(formData.maximum || 2),
        },{
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const eventObj = {
        ...res.data,
        start: new Date(res.data.start),
        end: new Date(res.data.end),
        maximum: new Number(res.data.maximum || 2),
        isGroup: new Boolean(res.data.isGroup || false),
      }
        setEvents([...events, eventObj]);
      }
    } catch (err) {
      console.error("Error saving event:", err);
      if(err.data?.messages == "Time slot is already taken")
        alert("באותו זמן המאמן יש לו שיעור עם מתאמנים אחרים")
      else alert("אירעה שגיאה בעת שמירת הנתונים. נסה שוב מאוחר יותר");
    } finally{
      closeModal();
      setIsLoading(false); // סיום טעינה
    }
  };
  
  const deleteEvent = async () => {
    try {
      await apiService.delete(`/appointments/${currentEvent._id}`,{
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
      setEvents(events.filter((e) => e._id !== currentEvent._id));
      closeModal();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Error deleting event");
    }
    closeModal();
  };

  const eventStyleGetter = (event) => {
    const isBlocked = blockedEvents.some(
        (blockedEvent) =>
            event.start.getTime() >= blockedEvent.start && event.end.getTime() <= blockedEvent.end
    );

    const style = {
        backgroundColor: isBlocked ? 'red' : '#007bff', // צבע אדום לפגישות חסומות
        color: 'white',
        borderRadius: '5px',
        border: 'none',
        padding: '5px',
    };

    return { style };
};

  const ee = [
    ...events.map(appt=>({
      ...appt,
      blocked: false,
    })),
    ...blockedEvents.map(appt=>({
      ...appt,
      blocked: false,
    }))
  ]
  return (
    <div className="App">
      {isLoading && <Spinner animation="border" />}
      <Calendar
        localizer={localizer}
        events={ee}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week", "day"]} // אין תצוגת "agenda"
        style={{ height: 600, margin: "50px" }}
        selectable
        rtl={true} // הפעלת מצב ימין-לשמאל
        onSelectSlot={(slotInfo) =>
          openModal({ start: slotInfo.start, end: slotInfo.end })
        }onSelectEvent={(event) => openModal(event)}
        min={new Date(new Date().setHours(8, 0, 0))} // 08:00
        max={new Date(new Date().setHours(23, 0, 0))} // 22:00
        eventPropGetter={eventStyleGetter} // עיצוב מותאם אישית
        messages={customMessages} // הגדרות עברית ללוח השנה
        formats={{
          dateFormat: "d", // מספר היום בלבד
          dayFormat: (date) => moment(date).format("ddd"), // א, ב, ג...
          weekdayFormat: (date) => moment(date).format("dddd"), // ראשון, שני...
          monthHeaderFormat: (date) => moment(date).format("MMMM YYYY"), // ינואר 2024
          weekHeaderFormat: (date) => moment(date).format("D MMM"),//`${moment(start).format("D MMMM")} - ${moment(end).format("D MMMM")}`, // טווח שבועי בעברית        
          dayHeaderFormat: (date) => moment(date).format("dddd, DD/MM"), // ראשון, 15/01
          timeGutterFormat: (date) => moment(date).format("HH:mm"), // שעות בציר הזמן
          eventTimeRangeFormat: ({ start, end }) =>
          `${moment(start).format("HH:mm")} - ${moment(end).format("HH:mm")}`, // טווח שעות באירוע
          eventTimeRangeStartFormat: (start) => moment(start).format("HH:mm"), // שעת התחלה
          eventTimeRangeEndFormat: (end) => moment(end).format("HH:mm"), // שעת סיום
      }}

      />
  
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentEvent ? "ערוך פגישה" : "הוסף פגישה"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
              <Form.Control
                type="text"
                placeholder="DD/MM/YYYY HH:mm"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formEnd">
              <Form.Label>תאריך סיום</Form.Label>
              <Form.Control
                type="text"
                placeholder="DD/MM/YYYY HH:mm"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
              />
            </Form.Group>

            {localStorage.getItem("role") == "coach" &&
            <Form.Group controlId="formTrainee">
              <Form.Check // prettier-ignore
                type="switch"
                id="custom-switch"
                label="פגישה קבוצתית"
                checked={formData.isGroup}
                onChange={()=>{setFormData({...formData,maximum: 2, isGroup: !formData.isGroup});}}
              />
              <Form.Label>מתאמן</Form.Label><br/>
              {formData.isGroup && <span>בחר כמות מקסימאלית של משתתפים</span>}
              {formData.isGroup && <input type='number' min={2} max={10} value={formData.maximum} onChange={(e)=>{setFormData({...formData,maximum: e.target.value})}}/>}
              {formData.isGroup?<Form.Control
                as="select"
                multiple
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
