const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Board } = require("../schema/board.schema");
const { User } = require("../schema/user.schema");
dotenv.config();

router.put("/addMember/:id", async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  // Regular expression for validating an email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  try {
    if (!email || !emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    const board = await Board.findById(id);
    const user = await User.findOne({ email: email });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    } 
    else if (board.members.includes(email)) {
      return res.status(400).json({ message: "User is already a member" });
    } 
    else {
      if (!user) {
        return res.status(400).json({ message: "User does not exist!" });
      } else {
        const updateBoard = await Board.findByIdAndUpdate(
          id,
          { $addToSet: { members: email } },
          { new: true }
        );
        res
          .status(200)
          .json({ message: "User added to Board successfully", updateBoard });
      }
    }
  } catch (error) {
    res.status(400).json({ message: "Error updating board", error });
  }
});

module.exports = router;
