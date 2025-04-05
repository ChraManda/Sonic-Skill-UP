const mongoose = require("mongoose");
const QuizSession = mongoose.model("QuizSession");
const Question = mongoose.model("Question");
const User = mongoose.model("Users");
const { v4: uuidv4 } = require("uuid");

module.exports = (app) => {

    // Start a quiz session
    app.post("/api/v1/quizsession/start", async (req, res) => {
        try {
            const { person, category } = req.body;

            // Validate category
            if (!["general", "interval_training", "note_training"].includes(category)) {
                return res.status(400).json({ message: "Invalid category type" });
            }

            // Check if the user exists
            const userExists = await User.findById(person);
            if (!userExists) {
                return res.status(404).json({ message: "User not found" });
            }

            // Fetch 10 random questions from the selected category
            const questions = await Question.aggregate([
                { $match: { category } },
                { $sample: { size: 10 } } // Randomly selects 10 questions
            ]);

            if (questions.length === 0) {
                return res.status(400).json({ message: "Not enough questions in this category" });
            }

            // Generate a unique quiz ID
            const quizId = uuidv4();

            // Create a new quiz session
            const newQuizSession = await QuizSession.create({
                quizId,
                person,
                category,
                totalQuestions: questions.length,
                correctAnswers: 0,
                incorrectAnswers: 0,
                score: 0,
                difficultyLevel: 1,
                questions: questions.map(q => q._id),
            });

            // Populate questions before sending response
            await newQuizSession.populate("questions");

            res.status(201).json({ message: "Quiz session started successfully", quizSession: newQuizSession });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

    // Get Quiz Sessions (Filtered by category if provided)
    app.get('/api/v1/quizsessions', async (req, res) => {
        try {
            const { category } = req.query;

            let filter = {};
            if (category) {
                if (!["general", "interval_training", "note_training"].includes(category)) {
                    return res.status(400).json({ message: "Invalid category type" });
                }
                filter.category = category;
            }

            const quizSessions = await QuizSession.find(filter).populate('questions');
            res.status(200).json({ message: "Quiz sessions fetched successfully", quizSessions });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

    // Delete a Quiz Session by ID
    app.delete('/api/v1/delete/quizsession/:id', async (req, res) => {
        try {
            const { id } = req.params;

            // Check if the ID is a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid quiz session ID" });
            }

            const deletedQuizSession = await QuizSession.findByIdAndDelete(id);

            if (!deletedQuizSession) {
                return res.status(404).json({ message: "Quiz session not found" });
            }

            res.status(200).json({ message: "Quiz session deleted successfully" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

    //Submit a Quizsession
    app.post("/api/v1/quizsession/submit", async (req, res) => {
        try {
            const { quizId, person, correctAnswers, incorrectAnswers } = req.body;
    
            if (!quizId || !person) {
                return res.status(400).json({ message: "Quiz ID and User ID are required." });
            }
    
            const quizSession = await QuizSession.findOne({ quizId, person });
    
            if (!quizSession) {
                return res.status(404).json({ message: "Quiz session not found." });
            }
    
            // Update quiz session stats
            quizSession.correctAnswers = correctAnswers;
            quizSession.incorrectAnswers = incorrectAnswers;
            quizSession.score = correctAnswers * 10; // Adjust scoring logic as needed
    
            await quizSession.save();
    
            // Update user statistics
            let userStats = await Statistics.findOne({ person });
    
            if (!userStats) {
                userStats = new Statistics({ person });
            }
    
            // Update statistics
            userStats.totalQuizzes += 1;
            userStats.totalCorrectAnswers += correctAnswers;
            userStats.totalIncorrectAnswers += incorrectAnswers;
    
            const accuracy = (correctAnswers / (correctAnswers + incorrectAnswers)) * 100;
            userStats.recentAccuracy.push(accuracy);
    
            if (userStats.recentAccuracy.length > 10) {
                userStats.recentAccuracy = userStats.recentAccuracy.slice(-10);
            }
    
            userStats.averageAccuracy =
                userStats.recentAccuracy.reduce((sum, a) => sum + a, 0) / userStats.recentAccuracy.length;
    
            // Update weak/strong areas
            if (accuracy >= 80 && !userStats.strongAreas.includes("general")) {
                userStats.strongAreas.push("general");
            } else if (accuracy < 60 && !userStats.weakAreas.includes("general")) {
                userStats.weakAreas.push("general");
            }
    
            await userStats.save();
    
            res.status(200).json({ message: "Quiz results saved successfully", quizSession, statistics: userStats });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });
    
};
