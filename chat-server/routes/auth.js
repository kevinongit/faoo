const express = require('express');
const router = express.Router();
const data = require('../data/data.json');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { id, password } = req.body;
  logger.info(`Login attempt for user: ${id}`);

  const user = data.users.find(u => u.id === id && u.password === password);

  if (user) {
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET
    );

    console.log(`User ${user.id} logged in`);
    logger.info(`User ${user.id} logged in successfully`);
    res.send({ user: { id: user.id }, token });
  } else {
    logger.warn(`Failed login attempt for user: ${id}`);
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// // Login endpoint for MongoDB
// router.post("/login", async (req, res) => {
//   try {
//     const user = await User.findOne({ userId: req.body.userId });
//     if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
//       console.log(`Invalid login credentials for ${req.body.userId}`);
//       return res.status(400).send({ error: "Invalid login credentials" });
//     }
//     const token = jwt.sign(
//       { _id: user._id.toString() },
//       process.env.JWT_SECRET
//     );
//     const { _id, __v, password, ...aUser } = user.toObject();
//     console.log(`User ${aUser.userId} logged in`);
//     res.send({ user: aUser, token });
//   } catch (error) {
//     console.log(`Error logging in: ${error}`);
//     res.status(400).send(error);
//   }
// });

module.exports = router;
