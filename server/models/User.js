const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    maxlength: 10,
  },
  password: { type: String, required: true },
  isSuperUser: { type: Boolean, default: false },
  avatarUrl: String,
  username: { type: String, required: true },
  nickname: String,
  lastAccess: String,
  englishName: String,
  phone: String,
  email: { type: String, required: true, unique: true },
  homeAddress: String,
  homePhone: String,
  job: String,
  company: String,
  workAddress: String,
  workPhone: String,
  mailReceiveAddress: String,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
