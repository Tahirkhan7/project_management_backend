const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../schema/user.schema");
const { Board } = require("../schema/board.schema");
const { Task } = require("../schema/task.schema");

dotenv.config();

router.get("/all", async (req, res) => {
    const { email } = req.query;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }
  
    try {
      const tasks = await Task.find({ assignedTo: email });
  
      if (tasks.length > 0) {
        res.status(200).json(tasks);
      } else {
        res.status(404).json({ message: "No tasks found!" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks", error });
    }
  });
  
  

router.post("/add", async (req, res) => {
  const { title, priority, assignedTo, checklist, dueDate, category, boardId } =
    req.body;

  try {
    const task = new Task({
      title,
      priority,
      assignedTo,
      checklist,
      dueDate,
      category,
      boardId,
    });
    await task.save();
    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(400).json({ message: "Error creating task", error });
  }
});

router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { title, priority, assignedTo, checklist, dueDate, category } =
    req.body;

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { title, priority, assignedTo, checklist, dueDate, category },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(400).json({ message: "Error updating task", error });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: "Error fetching task", error });
  }
});

module.exports = router;
