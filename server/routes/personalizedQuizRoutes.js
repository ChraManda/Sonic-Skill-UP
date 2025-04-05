const mongoose = require("mongoose");
const PersonalizedQuiz = mongoose.model("PersonalizedQuiz");
const Question = mongoose.model("Question");
const QuizSession = mongoose.model("QuizSession");

module.exports = (app) => {

    // Generate a personalized quiz for the general category
    app.post("/api/v1/personlize/quizsession/start", async (req, res) => {
        try {
            const { person, personalized } = req.body; 
    
            if (!person) {
                return res.status(400).json({ message: "User ID is required." });
            }
     
            let questions;
    
            if (personalized) {
                // Check if user has a personalized quiz
                const personalizedQuiz = await PersonalizedQuiz.findOne({ person }).populate("questions");
    
                if (!personalizedQuiz) {
                    return res.status(404).json({ message: "No personalized quiz found. Generate one first." });
                }
    
                questions = personalizedQuiz.questions;
            } else {
                // If not a personalized quiz, get random questions from general category
                questions = await Question.aggregate([
                    { $match: { category: "general" } },
                    { $sample: { size: 10 } }
                ]);
            }
    
            if (questions.length === 0) {
                return res.status(400).json({ message: "Not enough questions available." });
            }
    
            const quizId = Math.random().toString(36).slice(2, 9);
    
            // Create a new quiz session
            const newQuizSession = new QuizSession({
                quizId,
                person,
                category: "general",
                totalQuestions: questions.length,
                correctAnswers: 0,
                incorrectAnswers: 0,
                score: 0,
                difficultyLevel: 1,
                questions: questions.map(q => q._id),
            });
    
            await newQuizSession.save();
            res.status(201).json({ message: "Quiz session started successfully", quizSession: newQuizSession });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });
    

    // Fetch the personalized quiz for a user
    app.get("/api/v1/get/personalizedQuiz/:userId", async (req, res) => {
        try {
            const { userId } = req.params;
            const personalizedQuiz = await PersonalizedQuiz.findOne({ person: userId }).populate("questions");

            if (!personalizedQuiz) {
                return res.status(404).json({ message: "No personalized quiz found for this user." });
            }

            res.status(200).json({ message: "Personalized quiz fetched successfully", personalizedQuiz });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

    // Delete a personalized quiz for a user
    app.delete("/api/v1/delete/personalizedQuiz/:userId", async (req, res) => {
        try {
            const { userId } = req.params;
            const deletedQuiz = await PersonalizedQuiz.findOneAndDelete({ person: userId });

            if (!deletedQuiz) {
                return res.status(404).json({ message: "No personalized quiz found to delete." });
            }

            res.status(200).json({ message: "Personalized quiz deleted successfully" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

};
