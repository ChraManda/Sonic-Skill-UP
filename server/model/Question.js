const mongoose = require('mongoose');

const {Schema} = mongoose;

const QuestionSchema = new Schema({
  category: { 
    type: String, 
    enum: ["general", "interval_training", "note_training"], 
    required: true 
  },
  questionText: { type: String, required: true },
  questionImage: { type: String, default: "" },
  correctAnswer: { type: String, required: true },
  correctOptionIndex: { type: Number, required: true },
  options: [
    {
      note: { type: String, required: true },
      images: { type: String, required: true },
      sound: { type: String, required: true }
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
},
{ timestamps: true }
);

module.exports = mongoose.model('Question', QuestionSchema);
