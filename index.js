require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Question = require("./models/model");

const app = express();

// Set up middleware
app.use(bodyParser.json());

// port
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let questions = [];

// Endpoint for creating a new question
app.post("/questions", async (req, res) => {
  const { question, options } = req.body;

  if (!question || !options) {
    return res
      .status(400)
      .send({ error: "Question and options are required." });
  }

  try {
    const newQuestion = await Question.create({ question, options });
    res.status(201).send(newQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to create question." });
  }
});
// Define API endpoints
app.post("/questions/:id/responses", async (req, res) => {
  const questionId = req.params.id;
  const response = req.body.response;

  // Update the question's responses in the database
  const question = await Question.findById(questionId);
  question.responses[response]++;
  await question.save();

  res.sendStatus(200);
});

app.get("/questions/:id/percentage", async (req, res) => {
  const questionId = req.params.id;

  // Query the database for the number of responses for each option
  const question = await Question.findById(questionId);
  const totalResponses =
    question.responses.optionA + question.responses.optionB;
  const percentageA =
    totalResponses > 0
      ? (question.responses.optionA / totalResponses) * 100
      : 0;
  const percentageB =
    totalResponses > 0
      ? (question.responses.optionB / totalResponses) * 100
      : 0;

  res.json({ optionA: percentageA, optionB: percentageB });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: error.message });
});

// Start the server
app.listen(process.env.PORT || 8080, () => {
  console.log("Server listening on port 3000");
});
