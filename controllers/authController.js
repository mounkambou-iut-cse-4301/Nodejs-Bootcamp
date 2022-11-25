const {promisify}=require('util')
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/AppError");
const { log } = require('console');

const signToken = (id) => {
  return jwt.sign({ id:id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Get the token if exist
  let token
  if (
    req.headers.authorization 
    // &&
    // req.headers.authorization.startWith('Bearer')
  ) {
     token = req.headers.authorization.split(" ")[1];
  }
  if(!token){
    return next(new AppError("You are not logged in! Please log in to get access", 401))
  }
  // Verification token

  //This return a promise
const decoded= await promisify(jwt.verify)(token,process.env.JWT_SECRET)

  //Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if(!currentUser){
    return next(new AppError("The user belonging to this token does no longer exist.", 401));
  }


  //Check if user change password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  //Grand access to protected route
  req.user=currentUser;
  next();
});

exports.restrictTo=(...roles)=>{
  return (req,res,next)=>{
    // roles [admin,lead-guide]
    if(!roles.includes(req.user.role)){
      return next(new AppError('You do not have permission to access this action.', 403))
    }
next();
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
//1 Get user based on post email
const user =await User.findOne({email:req.body.email})
if(!user){
  return next(new AppError('There is no user with this email addess.',404))
}

//2 Generate the random reset token
const resetToken=user.createPasswordReset();
// save reset Token
await user.save({validateBeforeSave:false}); // Will desactivate all the validators we have on our schema


// 3 send email

})
exports.resetPassword = catchAsync(async (req, res, next) => {})

