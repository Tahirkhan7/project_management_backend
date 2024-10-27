const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../schema/user.schema");
const { Board } = require("../schema/board.schema");
dotenv.config();

router.get("/", async (req, res) => {
  const { email } = req.query; 
  const users = await User.find({ email: { $ne: email } }).select("-password -createdAt -__v");
  if (!users) {
    return res.status(400).json({ message: "No Users found!" });
  }
  res.status(200).json(users);
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Wrong email or password" });
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "Please enter correct password!" });
  }
  const payload = { id: user._id };
  const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "2h",
  });
  const expirationTime = Date.now() + 2 * 60 * 60 * 1000;

  const board = await Board.findOne({ owner: user.email }).select('_id');
  res
    .status(200)
    .json({ username: user.name, email: user.email, boardId: board._id, token, expiresAt: new Date(expirationTime).toISOString() });
});

router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res
      .status(400)
      .json({ message: "User already exists with this email!" });
  }
  if (confirmPassword !== password) {
    return res
      .status(400)
      .json({ message: "Confirm password does not match!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  const board = new Board({
    boardName: `${name}-board`,
    owner: email,
    members: [email],
  });
  await board.save();

  res.status(201).json({ message: "User registered successfully" });
});

router.put("/update", async (req, res) => {
  const { id, email, name, password, newPassword } = req.body;

  try {
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect current password!" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (newPassword) user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "An error occurred while updating the user" });
  }
});

router.get("/:email", async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email }).select(
    " -createdAt -__v"
  );
  if (!user) {
    return res.status(404).json({ message: "User doesn't exists!" });
  }
  res.status(200).json(user);
});

module.exports = router;
