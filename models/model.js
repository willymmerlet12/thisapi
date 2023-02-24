const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  responses: {
    type: [Number],
    default: [0, 0],
  },
});

module.exports = mongoose.model("Question", QuestionSchema);
