const mongoose = require("mongoose");
const Statistics = mongoose.model("Statistics");
const User = mongoose.model("Users");
const QuizSession = mongoose.model("QuizSession");

module.exports = (app) => {

    // Update statistics only for the "general" category
    app.put("/api/v1/statistics/update/:personId", async (req, res) => {
        try {
            const { personId } = req.params;
    
            // Validate user
            const user = await User.findById(personId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            // Fetch the latest quiz session of the user
            const latestQuiz = await QuizSession.findOne({ person: personId }).sort({ createdAt: -1 });
    
            if (!latestQuiz) {
                return res.status(400).json({ message: "No quiz session found for this user" });
            }
    
            const { correctAnswers, incorrectAnswers, totalQuestions, category } = latestQuiz;
            const accuracy = (correctAnswers / totalQuestions) * 100;
    
            // Fetch or create user statistics
            let userStats = await Statistics.findOne({ person: personId });
            if (!userStats) {
                userStats = new Statistics({ 
                    person: personId, 
                    totalQuizzes: 0, 
                    totalCorrectAnswers: 0, 
                    totalIncorrectAnswers: 0, 
                    recentAccuracy: [], 
                    strongAreas: [], 
                    weakAreas: [] 
                });
            }
    
            // **STREAK LOGIC**
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const lastQuizDate = user.lastQuizDate ? new Date(user.lastQuizDate) : null;
    
            if (lastQuizDate) {
                const diffDays = Math.floor((today - lastQuizDate) / (1000 * 60 * 60 * 24));
                user.streak = diffDays === 1 ? user.streak + 1 : diffDays > 1 ? 0 : user.streak;
            } else {
                user.streak = 1;
            }
            user.lastQuizDate = today;
    
            // **Update Statistics**
            userStats.totalQuizzes += 1;
            userStats.totalCorrectAnswers += correctAnswers;
            userStats.totalIncorrectAnswers += incorrectAnswers;
    
            userStats.recentAccuracy.push(accuracy);
            if (userStats.recentAccuracy.length > 10) {
                userStats.recentAccuracy = userStats.recentAccuracy.slice(-10);
            }
            userStats.averageAccuracy = userStats.recentAccuracy.reduce((sum, a) => sum + a, 0) / userStats.recentAccuracy.length;
    
            // **Weak & Strong Areas Logic**
            if (category) {
                if (accuracy >= 80) {
                    if (!userStats.strongAreas.includes(category)) {
                        userStats.strongAreas.push(category);
                    }
                    userStats.weakAreas = userStats.weakAreas.filter(c => c !== category);
                } else if (accuracy < 60) {
                    if (!userStats.weakAreas.includes(category)) {
                        userStats.weakAreas.push(category);
                    }
                    userStats.strongAreas = userStats.strongAreas.filter(c => c !== category);
                }
            }
    
            // **Update User Points & Leveling**
            const earnedPoints = correctAnswers * 10;
            user.points = Math.max(0, user.points + earnedPoints);
    
            let nextLevelPoints = 100 * Math.pow(1.2, user.level - 1);
            while (user.points >= nextLevelPoints) {
                user.level += 1;
                nextLevelPoints = 100 * Math.pow(1.2, user.level - 1);
                const newBadge = `Level ${user.level} Achieved`;
                if (!user.badges.includes(newBadge)) {
                    user.badges.push(newBadge);
                }
            }
    
            await userStats.save();
            await user.save();
    
            res.status(200).json({ message: "Statistics and user updated successfully", statistics: userStats, user });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });
    
    

    // Get user statistics (Only for general category)
    app.get("/api/v1/statistics/:userId", async (req, res) => {
        try {
            const { userId } = req.params;
            const userStatistics = await Statistics.findOne({ person: userId });

            if (!userStatistics) {
                return res.status(404).json({ message: "Statistics not found for this user" });
            }
            
            res.status(200).json({ 
                message: "User statistics fetched successfully", 
                statistics: userStatistics 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

};
