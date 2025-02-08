const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['coach', 'trainee'], required: true },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  maxMeetingsPerWeek: { type: Number}, // ברירת מחדל: 3 פגישות בשבוע
  fn: { type: String, required: true },
  ln: { type: String, required: true },
  birthday: { type: String }, // גיל
  phoneNumber: { type: String }, // מספר טלפון
  created_at: { type: Date, default: Date.now },
});


// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

module.exports = mongoose.model('User', UserSchema);
