const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const port = process.env.Port;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGOURL = process.env.MONGO_URL;


mongoose.connect(MONGOURL).then(()=> {
    console.log("Database connection successful!")
})
.catch((err) => console.log("Error Connecting to MongoDB"))


//Import Models
require("./model/Admin");
require("./model/Question");
require("./model/User");
require("./model/QuizSession");
require("./model/Statistics");
require("./model/PersonalizedQuiz");

//Import Routes
require("./routes/adminRoutes")(app);
require("./routes/questionRoutes") (app);
require("./routes/user") (app);
require("./routes/quizSessionRoutes") (app);
require("./routes/statisticsRoutes") (app);
require("./routes/personalizedQuizRoutes") (app);

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});

