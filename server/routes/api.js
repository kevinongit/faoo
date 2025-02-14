const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth, superUserAuth } = require("../middleware/auth");

const router = express.Router();

// Signup endpoint
router.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET
    );
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.body.userId });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      console.log(`Invalid login credentials for ${req.body.userId}`);
      return res.status(400).send({ error: "Invalid login credentials" });
    }
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET
    );
    const { _id, __v, password, ...aUser } = user.toObject();
    console.log(`User ${aUser.userId} logged in`);
    res.send({ user: aUser, token });
  } catch (error) {
    console.log(`Error logging in: ${error}`);
    res.status(400).send(error);
  }
});

// Signout endpoint
router.post("/signout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send({ message: "Successfully signed out" });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all users (super user only)
router.get("/users", superUserAuth, async (req, res) => {
  try {
    const usersDb = await User.find({});
    const users = usersDb.map((user) => {
      return {
        userId: user.userId,
        username: user.username,
        age: user.age,
        job: user.job,
        title: user.title,
        avatarUrl: user.avatarUrl,
      };
    });
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
