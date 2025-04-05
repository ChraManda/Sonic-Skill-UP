const mongoose = require('mongoose');

const {Schema} = mongoose;

const QuizSessionSchema = new Schema({
  quizId: { type: String, required: true, unique: true },
  person: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { 
    type: String, 
    enum: ["general", "interval_training", "note_training"],
    required: true
  },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  incorrectAnswers: { type: Number, required: true },                         
  score: { type: Number, required: true },
  difficultyLevel: { type: Number, default: 1 },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
},
{ timestamps: true }
);

module.exports = mongoose.model('QuizSession', QuizSessionSchema);
