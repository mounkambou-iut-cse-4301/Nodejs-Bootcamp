const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please tell us your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please tell us your password"],
    minlength: 8,
    // Not return to the output
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please tell us your password"],
    validate: {
      //This only work on SAVE// Create
      validator: function (el) {
        return el === this.password;
      },
      message: "Password does not match",
    },
  },
  passwordChangedAt:Date
});

//Add document middleware: runs before .save() and .create()
userSchema.pre("save", async function (next) {
  // Only run this function if password was modified
  if (!this.isModified("password")) return next();
  //encription
  this.password = await bcript.hash(this.password, 12);

  //delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Check password. Instance method and will be available on all docs
userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };

  userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };

const User = mongoose.model("User", userSchema);

module.exports = User;
