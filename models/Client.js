const mongoose = require('mongoose');


const ClientSchema = new mongoose.Schema({
  u_id:{type:String,required: true},
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_no: {
    type: String,
    required: true,
    minlength: 12,
    maxlength: 12,
    match: /^[0-9]+$/
  },
  address:{type:String},
  note:{type:String},
  measurements: {
    chest: {type:String},
    waist: {type:String},
    hips: {type:String},
    shoulders: {type:String},
    armLength: {type:String},
    totalLength: {type:String},
    neck: {type:String},
    inseam: {type:String}
  }
},
{
    timestamps: true // ➕ Automatically adds createdAt and updatedAt
}
);

module.exports = mongoose.model('Client', ClientSchema);
