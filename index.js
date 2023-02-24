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
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let questions = [];

//Endpoint to get random question
app.get("/questions/random", async (req, res) => {
  try {
    const count = await Question.countDocuments();
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne().skip(random);
    if (!question) {
      return res.status(404).send({ error: "No questions found." });
    }
    res.send(question);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to retrieve question." });
  }
});

//Endpoint to get questions
app.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).send(questions);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to retrieve questions." });
  }
});

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

  // Find the question in the database
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).send({ error: "Question not found." });
    }

    // Check if the response is a valid option
    if (!question.options.includes(response)) {
      return res.status(400).send({ error: "Invalid response option." });
    }

    // Find the index of the response in the options array
    const optionIndex = question.options.indexOf(response);

    // If the response was found, update the corresponding response count and save to the database
    if (optionIndex !== -1) {
      question.responses[optionIndex]++;
      await question.save();
      console.log(`Question ${questionId} updated with response: ${response}`);
      res.sendStatus(200);
    } else {
      // Response was not found in the options array
      return res.status(400).send({ error: "Invalid response option." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to update response" });
  }
});

app.get("/questions/:id/percentage", async (req, res) => {
  const questionId = req.params.id;

  // Query the database for the question
  const question = await Question.findById(questionId);

  if (!question) {
    return res.status(404).send({ error: "Question not found." });
  }

  // Calculate the total number of responses for all options
  const totalResponses = Object.values(question.responses).reduce(
    (total, count) => total + count,
    0
  );

  // Calculate the percentage for each option
  const percentages = {};
  for (let option in question.responses) {
    const count = question.responses[option];
    const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
    percentages[option] = percentage;
  }

  res.json(percentages);
});

app.get("/", (req, res) => {
  res.json("Hello");
});

app.all("*", (req, res) => {
  res.status(404).json({ message: error.message });
});

// Start the server
app.listen(process.env.PORT || 8080, () => {
  console.log(`Server listening on port ${PORT}`);
});
