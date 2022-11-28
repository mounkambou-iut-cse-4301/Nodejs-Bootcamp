const { error } = require('console');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require("helmet");

const AppError=require('./utils/AppError')
const globalErrorHandler=require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
// Global middleware
// 1) MIDDLEWARES
//Setting Security HTTP Headers
app.use(helmet());

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request frome same API
const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 60 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 60 minutes)
  message: 'Too many requests from this IP, please try again in an hour!'

})

// Apply the rate limiting middleware to all requests
app.use(limiter)

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.static(`${__dirname}/public`));


app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Handling Unhandled Routes
app.all('*',(req,res,next)=>{

  next(new AppError(`Can't find ${req.originalUrl} on this server`,404))

});

//Implementing a Global Error Handling Middleware
app.use(globalErrorHandler)

module.exports = app;
