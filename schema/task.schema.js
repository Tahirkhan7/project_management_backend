const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ["high", "moderate", "low"],
    required: true,
  },
  assignedTo: {
    type: String,
    required: true,
  },
  checklist: {
    type: [String],
    default: [],
  },
  dueDate: {
    type: Date,
    required: false,
  },
  boardId: {
    type: Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  category: {
    type: String,
    enum: ["backlog", "to-do", "in-progress", "done"],
    default: "to-do",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = {
  Task,
};
