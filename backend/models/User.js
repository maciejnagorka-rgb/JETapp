const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // Dodane: JTAC, JTAC I itp.
  isAdmin: { type: Boolean, default: false },
  profile: {
    avatar: String,
    validity: [{
      airspace: String,
      iolRl: String,
      annualPhraseology: String,
      sixMthReview: String,
      academics: String,
      jtac: String,
      jtacIClassroom: String,
      jtacI: String,
      jtacE: String
    }],
    tracker: [{
      type: String,
      executionDate: Date,
      expireDate: Date
    }],
    metlTracker: [{
      type: String,
      executionDate: Date,
      expireDate: Date
    }]
  },
  tests: [{
    date: Date,
    evaluationType: String,
    grade: Number,
    supervisor: String,
    actions: String
  }]
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);