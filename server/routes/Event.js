const express = require('express');
const Appointment = require('../models/Event');
const {protect, protectRole} = require('../middleware/authMiddleware');
const moment = require('moment');
const { my, available, createEvent, updateEvent, deleteE, deleteAllE } = require('../controllers/Event');
const router = express.Router();

router.get('/my', protect, my);

router.get('/myCoachEvent', protect,protectRole("trainee"), available);

// קביעת פגישה
router.post('/', protect, createEvent);

router.put("/:id", protect, updateEvent);

router.delete("/:id", protect, deleteE);

router.delete("/", deleteAllE)
module.exports = router;
