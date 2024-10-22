const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../schema/user.schema");
dotenv.config();

router.get("/", async (req, res) => {
  const users = await User.find().select("-_id -password -createdAt -__v");
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
      return res.status(400).json({ message: "Wrong email or password" });
    }
    const payload = { id: user._id };
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '2h' });
    const expirationTime = Date.now() + 2 * 60 * 60 * 1000;
    res.status(200).json({ token, expiresAt: new Date(expirationTime).toISOString() });
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
  res.status(201).json({ message: "User registered successfully" });
});

router.get("/:email", async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email }).select(" -password -createdAt -__v");
  if (!user) {
    return res.status(404).json({ message: "User doesn't exists!" });
  }
  res.status(200).json(user);
});

module.exports = router;
