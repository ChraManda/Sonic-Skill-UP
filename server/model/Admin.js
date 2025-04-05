const mongoose = require('mongoose');
const {Schema} = mongoose;
const Question = require('./Question');

const AdminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', AdminSchema);
