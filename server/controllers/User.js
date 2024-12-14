const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {protect, protectRole} = require('../middleware/authMiddleware');
const Event = require('../models/Event');

const router = express.Router();

// פונקציה ליצירת טוקן
const generateToken = async (id) => {
    try{return await jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });}
    catch(error) { console.error(error);}
};

// רישום משתמש כמאמן
// POST /auth/register
// return [Token and Role] (status 201) or [Error message] (status 400)
const register = async (req, res) => {
    console.log("*********Start Resgister*************");
    const { username, password, fn, ln, birthday,phoneNumber} = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ message: 'User already exists' });
        const body = { fn:fn, ln:ln, birthday: birthday, phoneNumber:phoneNumber, username:username, password:password, role:"coach" };
        const user = await User.create(body);
        console.log("Req body", body);
        console.log("******");
        const user2 = await User.findOne({ username });
        const token = generateToken(user2._id);
        console.log("*********End Resgister - Success*************");
        return res.status(201).json({ token: token, role: user.role, id:user._id });
    } catch (error) {
        console.error(error);
        console.log("*********End Resgister - Error*************");
        return res.status(400).json({ message: error.message });
    }
}

// התחברות
// POST /auth/login
// return [Token and Role] (status 201) or [Error message] (status 400)
const login = async (req, res) => {
    console.log("*********Start Login*************");
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        const token = await generateToken(user._id);
        console.log("*********End Login - Success*************");
        return res.status(200).json({ token: token, role: user.role, id: user._id });
    } catch (error) {
        console.error(error);
        console.log("*********End Login - Error*************");
        return res.status(400).json({ message: error.message });
    }
};

//העברת ניתונים על המתחבר
// GET with Protect /auth/me
// return [data about user] (status 200) or [Error message] (status 400/404)
const me = async(req,res)=> {
    console.log("*********Start Get Me*************");
    try{
        const me = await User.findOne({_id: req.user._id});
        if(!me) return res.status(404).json({message: "don't have data about you"});
        console.log("*********End Get Me - Success*************");
        return res.status(200).json(me);        
    }
    catch(error){
        console.error(error);
        console.log("*********End Get Me - Error*************");
        return res.status(404).json({ message: error.message });
    }

}

//החזרת המתאמנים
// GET with Protect[Coach] /auth/myTrainee 
// return [list trainees] (status 200) or [Error message] (status 400/404)
const myTrainee = async(req,res)=>{
    console.log("*********Start list trainees*************");
    try{
        const trainees = await User.find({coachId: req.user._id});
        console.log("myTrainees", trainees);
        console.log("*********End list trainees - Success*************");
        if(trainees)
            return res.status(200).json(trainees);
        else return res.status(404).json([])
    }catch(err){
        console.error(err);
        console.log("*********End list trainees - Error*************");
        return res.status(400).json({message: err.message})
    }
}

//החזרת המאמן שלי
// GET with Protect[Trainee] /auth/myCoach 
// return [data user coach] (status 200) or [Error message] (status 400/404)
const myCoach = async(req,res)=>{
    console.log("*********Start myCoach*************");
    try{
        const coach = await User.find({_id: req.user.coachId});
        console.log("mycoach", coach);
        console.log("*********End myCoach - Success*************");
        if(coach)
        return res.status(200).json(coach);
        else return res.status(404).json([]);
    }catch(err){
        console.error(err)
        console.log("*********End myCoach - Error*************");
        return res.status(400).json({message: err.message})
    }
}

//יצירת מתאמן שלי
// POST with Protect[Coach] /auth/create-tranee 
// return [trainee and message] (status 200) or [Error message] (status 400/404)
const createTrainee = async (req, res) => {
    console.log("*********Start createTrainee*************");
    const { username, password, fn, ln, birthday,phoneNumber, maxMeetingsPerWeek} = req.body;
    try {
        // בדיקת אימייל ייחודי
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'היוזר זה כבר קיים במערכת.' });
    
        // יצירת מאומן חדש
        const newUser = new User({fn, ln, username, password, role: 'trainee', birthday: birthday, maxMeetingsPerWeek: maxMeetingsPerWeek ? maxMeetingsPerWeek : 3, phoneNumber, coachId: req.user._id});
        await newUser.save();
        console.log("*********End createTrainee - Success*************");
        return res.status(201).json({ message: 'המאומן נוצר בהצלחה!', user: newUser });
    } catch (error) {
        console.error(error);
        console.log("*********End createTrainee - Error*************");
        return res.status(400).json({ message: 'שגיאה ביצירת המאומן.' });
    }
}

//עדכון פרטים אישיים
// PUT with Protect /auth/me 
// return [new data user] (status 200) or [Error message] (status 400/404)
const me2 = async (req, res) => {
    console.log("*********Start PUT ME*************");
    try {
        const { _id, username, password, fn, ln, birthday,phoneNumber} = req.body;
        console.log("**");
        console.log("body");
        console.log(req.body);
        console.log("**");
        console.log("req.user", req.user);

        const updatedUser = await User.findByIdAndUpdate(req.user?._id ? req.user?._id : _id,{ username, fn, ln, birthday: birthday, phoneNumber}, { new: true });
        console.log("*********End PUT ME - Success*************");
        return res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err);
        console.log("*********End PUT ME - Error*************");
        return res.status(400).send("Error updating user profile");
    }
};

//עדכון פרטים אישיים
// PUT with Protect[Coach] /auth/myTrainee 
// return [new data user] (status 200) or [Error message] (status 400/404)
const myTrainee2 = async (req, res) => {
    console.log("*********Start PUT Trainee *************");
    try {
        const { _id,username, password, fn, ln, birthday,phoneNumber, maxMeetingsPerWeek} = req.body;
        const updatedUser = await User.findByIdAndUpdate(_id, { username, fn, ln, birthday: birthday, phoneNumber, maxMeetingsPerWeek: new Number(maxMeetingsPerWeek)}, { new: true });
        console.log("*********End PUT Trainee - Sccess*************");
        return res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err);
        console.log("*********End PUT Trainee - Error*************");
        return res.status(400).send("Error updating user profile");
    }
};

//מחיקת משתמש
// DELETE with Protect /auth/ 
// return [message] (status 200) or [Error message] (status 400/404)
const deleteU = async(req, res)=>{
    try {
        console.log("*********Start delete user *************");
        const deletedUser = await User.findByIdAndDelete(req.user._id);
        if (!deletedUser) return res.status(404).json({ message: "user not found" });
        if(req.user.role == "coach") {
        const deletedTrainees = await User.deleteMany({coachId: req.user._id});
        if (!deletedTrainees) return res.status(404).json({ message: "User not found" });

        const deletedEvents = await Event.deleteMany({coachId: req.user._id});
        if (!deletedEvents) return res.status(404).json({ message: "Event not found" });
        }
        else{
        const deletedEvents = await Event.deleteMany({traineesId: [req.user._id]});
        if (!deletedEvents) return res.status(404).json({ message: "Event not found" });
        }
        console.log("*********End delete user - Success *************");
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.log(err);
        console.log("*********End delete user - Error *************");
        return res.status(400).json({ message: err.message });
    }
}

//מחיקת משתמש
// DELETE with Protect /auth/myTrainee/:id
// return [message] (status 200) or [Error message] (status 400/404)
const deleteMyTrainee = async(req, res)=>{
    try {
        console.log("*********Start delete myTrainee *************");

        const deletedUser = await User.findOne({_id: req.params.id, coachId: req.user.id});
        if (!deletedUser) return res.status(404).json({ message: "user not found by the caoch" });
        const deletedTrainee = await User.deleteOne({coachId: req.user._id, _id: req.params.id});
        if (!deletedTrainee) return res.status(404).json({ message: "User not found" });
        console.log("*********End delete myTrainee - Success *************");
    } catch (err) {
        console.log(err);
        console.log("*********End delete user - Error *************");
        return res.status(400).json({ message: err.message });
    }
}

module.exports = {
    register, login, me, myTrainee, myCoach, createTrainee, me2, myTrainee2, deleteU, deleteMyTrainee
}

