const crypto=require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
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
  passwordChangedAt: Date,
  passwordResetToken:String,
  passwordResetExpires:Date

});

//Add document middleware: runs before .save() and .create()
userSchema.pre("save", async function (next) {
  // Only run this function if password was modified
  if (!this.isModified("password")) return next();
  //encription
  this.password = await bcrypt.hash(this.password, 12);

  //delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save',function(next){
if(!this.isModified("password") || this.isNew) return next();

this.passwordChangedAt=Date.now()-1000;
next();
});

// Check password. Instance method and will be available on all docs
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
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

userSchema.methods.createPasswordReset = function () {
 const resetToken=crypto.randomBytes(32).toString('hex');

 this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
 this.passwordResetExpires=Date.now()+10 *60*1000; // 10 minutes

 return resetToken;
};


const User = mongoose.model("User", userSchema);

module.exports = User;
