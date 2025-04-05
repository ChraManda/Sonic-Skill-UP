const mongoose = require("mongoose");
const Question = mongoose.model("Question");

module.exports = (app) => {
    
    // Add a question
    app.post("/api/v1/add/question", async (req, res) => {
        try {
            const { category, questionText, questionImage, correctAnswer, correctOptionIndex, options, createdBy } = req.body;
            
            if (!["general", "interval_training", "note_training"].includes(category)) {
                return res.status(400).json({ message: "Invalid category type" });
            }

            const newQuestion = await Question.create({
                category, questionText, questionImage, correctAnswer, correctOptionIndex, options, createdBy
            });

            res.status(201).json({ message: "Question Added Successfully", newQuestion });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

    // Get all questions from a category
    app.get("/api/v1/get/questions/:category", async (req, res) => {
        try {
            const { category } = req.params;

            if (!["general", "interval_training", "note_training"].includes(category)) {
                return res.status(400).json({ message: "Invalid category type" });
            }

            const questions = await Question.find({ category });
            res.status(200).json({ message: "Questions fetched successfully", questions });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

    // Get a single question from a category
    app.get("/api/v1/get/questions/:category/:id", async (req, res) => {
        try {
            const { category, id } = req.params;

            if (!["general", "interval_training", "note_training"].includes(category)) {
                return res.status(400).json({ message: "Invalid category type" });
            }

            const question = await Question.findById(id);
            if (!question || question.category !== category) {
                return res.status(404).json({ message: "Question not found in the selected category" });
            }

            res.status(200).json({ message: "Question fetched successfully", question });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

    // Update a single question
    app.put("/api/v1/update/question/:category/:id", async (req, res) => {
        try {
            const { category, id } = req.params;

            if (!["general", "interval_training", "note_training"].includes(category)) {
                return res.status(400).json({ message: "Invalid category type" });
            }

            let question = await Question.findById(id);
            if (!question || question.category !== category) {
                return res.status(404).json({ message: "Question not found in the selected category" });
            }

            // Update only provided fields
            Object.assign(question, req.body);

            const updatedQuestion = await question.save();
            res.status(200).json({ message: "Question updated successfully", updatedQuestion });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

    // Delete a question
    app.delete("/api/v1/delete/question/:category/:id", async (req, res) => {
        try {
            const { category, id } = req.params;

            if (!["general", "interval_training", "note_training"].includes(category)) {
                return res.status(400).json({ message: "Invalid category type" });
            }

            const question = await Question.findById(id);
            if (!question || question.category !== category) {
                return res.status(404).json({ message: "Question not found in the selected category" });
            }

            await Question.deleteOne({ _id: id });

            res.status(200).json({ message: "Question deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });
};
