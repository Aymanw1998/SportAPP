const path = require('path');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middleware/err');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const multer = require('multer');


//Lod env vars
dotenv.config({path: './config/.env'});
//Craete app
const app = express();
//Connect to DB
connectDB();
//Middleware to parse JSON requests
app.use(express.json());
//Cookie parser when login user the token is saved in the server and send to http client
app.use(cookieParser());

//Prevent attects
app.use(mongoSanitize()); // Sanitize data for privent NoSql injection attack
app.use(helmet()); // Set security headers
app.use(xss()); // Prevent XSS attacks

//Enable CORS
app.use(cors());
app.all('*', function (req, res, next) {
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.set(
    'Access-Control-Allow-Headers',
    'X-Requested-With,Content-Type,authorization'
  );
  next();
});

// Routes
const authRoutes = require('./routes/User');
const appointmentsRoutes = require('./routes/Event');
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Route middleware
app.get('/', (req, res) => { console.log("Server is up and running");res.send('Server is up and running'); });


//must be after routes call
//for catch 500-400 errors
app.use(errorHandler);

const httpServer = http.createServer(app)
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV;
httpServer.listen(
  PORT,
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`.blue.bold)
);

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});
