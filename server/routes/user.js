const mongoose = require("mongoose");
const User = mongoose.model("Users");
const bcrypt = require("bcrypt");
const QuizSession = mongoose.model("QuizSession");

module.exports = (app) => {
    //User Registration
    app.post("/api/v1/user/register", async (req, res) =>{
    console.log("Register user");
    const {email, password, userName} = req.body;
    try {
        const user = await User.findOne({email});
            if (user){
                return res.status(400).json({message: "User already exists!"});
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const userFields = {email, password: hashedPassword, userName};
            const response = await User.create(userFields);
            res.status(201).json({message: "User Created Successfuly", response});
            console.log(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
    });
    
   
    //Get user
    app.get("/api/v1/get/user/:id", async (req, res) => {
        const {id} = req.params;
        try {
            const response = await User.findById(id);
            res.status(200).json({message: "user fetched successfully", response})

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    });


//   // Get All users
     app.get("/api/v1/get/users", async (req, res) =>{
        try {
            const response = await User.find().select("email userName createdAt");
            res.status(200).json({message: "Users fetched sucessfully", response});
        
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: error.message });  
        }
     })

  
    // Get User Progress
    app.get("/api/v1/user/stats/:userId", async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId).select("userName totalPoints level badges streak lastQuizDate");
    
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            res.status(200).json({ message: "User progress fetched successfully", user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

    // User Quiz History
    app.get("/api/v1/quizsession/history/:userId", async (req, res) => {
        try {
            const { userId } = req.params;
    
            // Fetch last 15 quiz sessions for the user
            const quizHistory = await QuizSession.find({ person: userId })
                .sort({ createdAt: -1 })
                .limit(15) // Display only last 15 sessions
                .populate("questions");
    
            if (!quizHistory.length) {
                return res.status(404).json({ message: "No quiz history found for this user" });
            }
    
            res.status(200).json({ message: "Quiz history fetched successfully", quizHistory });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });
    

}