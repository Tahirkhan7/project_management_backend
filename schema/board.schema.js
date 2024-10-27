const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const boardSchema = new Schema({
  boardName: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  members: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Board = mongoose.model("Board", boardSchema);

module.exports = {
  Board,
};
