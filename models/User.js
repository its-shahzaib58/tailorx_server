const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  b_name: {type: String, required: true},
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_no: {
    type: String,
    required: true,
    minlength: 12,
    maxlength: 12,
    match: /^[0-9]+$/
  },
  password: { type: String, required: true },
  resetOtp:{type: String},
  resetOtpExpiry:{type: Date},
  logoUrl:{type:String},
  address:{type:String},
  website:{type:String}
});

module.exports = mongoose.model('User', UserSchema);
