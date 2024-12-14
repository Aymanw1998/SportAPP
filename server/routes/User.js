const express = require('express');
const {protect, protectRole} = require('../middleware/authMiddleware');
const { register, login, me, myTrainee, myCoach, createTrainee, me2, myTrainee2, deleteU, deleteMyTrainee } = require('../controllers/User');
const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/me', protect, me);

router.get('/myTrainee', protect, protectRole("coach"), myTrainee)

router.get('/myCoach', protect, protectRole("trainee"), myCoach)

router.post('/create-trainee', protect, protectRole("coach"), createTrainee);

router.put('/me', me2);

router.put('/myTrainee', protect, protectRole("coach"), myTrainee2);

router.delete('/', protect, deleteU)

router.delete('/myTrainee/:id',protect,protectRole("coach"), deleteMyTrainee)
module.exports = router;
