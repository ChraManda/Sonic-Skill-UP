const mongoose = require('mongoose');

const {Schema} = mongoose;

const StatisticsSchema = new Schema({
  person: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  averageAccuracy: { type: Number, default: 0 },
  recentAccuracy: [{ type: Number }],
  totalQuizzes: { type: Number, default: 0 },
  totalCorrectAnswers: { type: Number, default: 0 },
  totalIncorrectAnswers: { type: Number, default: 0 },
  strongAreas:[{type: String}], // attempted quiz above 80% accuracy
  weakAreas: [{ type: String }], // attempted quiz below 60% accuracy
},
{ timestamps: true }
);

module.exports = mongoose.model('Statistics', StatisticsSchema);
