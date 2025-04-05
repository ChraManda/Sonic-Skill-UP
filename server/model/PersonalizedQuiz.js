const mongoose = require('mongoose');

const {Schema} = mongoose;

const PersonalizedQuizSchema = new Schema({
  person: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  weakAreas: [{ type: String }],
  strongAreas: [{type: String}],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
},
{ timestamps: true }
);

module.exports = mongoose.model('PersonalizedQuiz', PersonalizedQuizSchema);
