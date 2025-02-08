const express = require('express');
const Event = require('../models/Event');
const {protect} = require('../middleware/authMiddleware');
const moment = require('moment');

// בדיקת התנגשות לפני יצירה או עדכון פגישה
const isOverlapping = async (start, end, coachId, eventId = null) => {
    try{
    const events = await Event.find({
    coachId,
    _id: { $ne: eventId }, // לא לכלול את הפגישה הנוכחית בעת עדכון
    $or: [
      { start: { $lt: end }, end: { $gt: start } }, // התנגשויות בזמן
    ],
    });
    return events.length > 0;
    }catch(err){
        console.error(err);
    }
};

const my = async (req, res) =>{
    console.log();
    console.log();
    console.log("*********Start get My Events*************");
    if(req.user.role === "coach"){
        try{
            const list = await Event.find({coachId: req.user._id});
            console.log("*********End get My Events - Success*************");
            return res.status(200).json(list)
        }catch(err){
            console.error(err);
            console.log("*********End get My Events - Error*************");
            return res.status(404).json({message:err.message});
        }
    }
    if(req.user.role === "trainee"){
        try{
        const list = await Event.find({traineesId: req.user._id});
        console.log("*********End get My Events - Success*************");
        return res.status(200).json(list)
        }catch(err){
        console.error(err);
        console.log("*********End get My Events - Error*************");
        return res.status(404).json({message:err.message});
        }
    }
}
const available = async (req, res) => {
    console.log();
    console.log();
    console.log("*********Start Available*************");
    const date = new Date(2024,0,1,0,0,0,0);
    const dateNow = new Date();  // מקבל את התאריך הנוכחי
    const nextMonth = new Date(dateNow.setMonth(dateNow.getMonth() + 2));  // מוסיף חודש אחד
    try {
        
        const appointments = await Event.find({ coachId: req.user.coachId, start: { $gte: new Date(date), $lt: new Date(nextMonth) }});
        console.log("hi availd", appointments, { coachId: req.user.coachId, start: new Date(date), end:new Date(nextMonth)})
        return res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        console.log("*********End Available - Error*************");
        return res.status(400).json({ message: error.message });
    }
}

// קביעת פגישה
const createEvent = async (req, res) => {
    console.log();
    console.log();
    console.log("*********Start createEvent*************");
    let {title, start, end, coachId, traineesId, maximum } = req.body;
    console.log(req.body);
    if(req.user.role === "coach") coachId = req.user._id
    if(req.user.role === "trainee") traineesId = req.user._id
    if (await isOverlapping(start, end, coachId)) return res.status(400).json({ message: "Time slot is already taken" });
    console.log("create event");
    if(req.user.role === "trainee"){
        // מציאת תחילת וסוף השבוע
        const startOfWeek = moment(start).startOf('week').toDate();
        const endOfWeek = moment(start).endOf('week').toDate();

        // בדיקת מגבלה ייחודית למתאמן
        const maxMeetingsPerWeek = req.user?.maxMeetingsPerWeek || 3; // ברירת מחדל: 3

        try{
            // סינון פגישות של אותו מתאמן בשבוע
            const eventsforTrainee = await Event.find({traineesId: {$all:[req.user._id]}})
            const traineeMeetingsThisWeek = await eventsforTrainee.filter((event) => event.start >= startOfWeek && event.end <= endOfWeek);
            if (traineeMeetingsThisWeek.length >= maxMeetingsPerWeek){ 
                console.log("*********End createEvent - Success*************");
                return res.status(400).json({message: "cannot add more event in this week"})
            }
        }catch(err){
            console.warn("err", error);
            console.log("*********End createEvent - Error*************");
            return res.status(400).json({ message: error.message });
        }
    }
    console.log({ title: title, coachId: coachId, traineesId: traineesId, start: new Date(start), end: new Date(end), maximum: maximum, updateBy: req.user.role,})
    try {
        
        const appointment = await Event.create({
            title: title,
            coachId: coachId,
            traineesId: traineesId,
            maximum: new Number(maximum ? maximum : 1),
            start: new Date(start),
            end: new Date(end),
            updateBy: req.user.role,
        });
        appointment.save();
        console.log("*********End createEvent - Success*************");
        return res.status(201).json(appointment);
    } catch (error) {
        console.log("err", error);
        console.log("*********End createEvent - Error*************");
        return res.status(400).json({ message: error.message });
    }
}

const updateEvent  = async (req, res) => {
    console.log("*********start updateEvent*************");
    const { title, start, end, coachId, traineesId,maximum } = req.body;
    console.log(start, end);
    if (await isOverlapping(start, end, coachId, req.params.id)) {
        console.log("ERROR")
        console.log("*********End updateEvent - SuccessW*************");
        return res.status(400).json({ message: "Time slot is already taken" });
    }
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, {
        title: title,
        coachId: coachId,
        traineesId: traineesId,
        start: new Date(start),
        maximum: new Number(maximum ? maximum : 1),
        end: new Date(end),
        updateBy: req.user.role,
        } , { new: true });

        console.log("GOOD", updatedEvent, title, start, end, coachId, traineesId,maximum)
        console.log("*********End updateEvent - Success*************");
        return res.status(200).json(updatedEvent);
    } catch (err) {
        console.error(err);
        console.log("*********End updateEvent - Error*************");
        return res.status(400).json({ message: err.message });
    }
}

const deleteE = async (req, res) => {
    try {
        console.log("*********Satrt deleteEvent*************");
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
        console.log("*********End deleteEvent - Success*************");
        return res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error(err);
        console.log("*********End deleteEvent - Error*************");
        return res.status(400).json({ message: err.message });
    }
};

const deleteAllE = async (req, res) => {
    try {
        console.log("*********Satrt deleteAllEvent*************");
        const deletedEvent = await Event.deleteMany({ end: { $lt: new Date() } });
        if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
        console.log("*********End deleteAllEvent - Success*************");
        return res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error(err);
        console.log("*********End deleteAllEvent - Error*************");
        return res.status(400).json({ message: err.message });
    }
};

module.exports = {my, available, createEvent, updateEvent, deleteE, deleteAllE};
