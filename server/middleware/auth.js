const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

const superUserAuth = async (req, res, next) => {
try {
    const token = req.header("Authorization");
    if (!token) {
    return res.status(401).send({ error: "Please authenticate." });
    }

    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
    return res.status(401).send({ error: "Please authenticate." });
    }

    if (!user.isSuperUser) {
    return res.status(403).send({ error: "Super user access required." });
    }

    req.token = token;
    req.user = user;
    next();
} catch (error) {
    return res.status(401).send({ error: "Please authenticate as super user." });
}
};

module.exports = { auth, superUserAuth };
