const mongoose = require("mongoose");

const {Schema} = mongoose;


const userSchema = new Schema({
    email: {type: String},
    password: {type: String},
    userName: {type: String, required: true},
    streak: {type: Number},
    level: { type: Number, default: 1 },
    badges: [{ type: String }],
    totalPoints: {type: Number},
    lastQuizDate: { type: Date },
    

},
{timestamps: true}
);

module.exports = mongoose.model('Users', userSchema);