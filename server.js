const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const connectToDatabase = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// Create express app
const app = express();

// Define dotenv file path
dotenv.config({ path: './config.env' });

// Connect to database
connectToDatabase();

// Body parser
app.use(express.json());

// Cookie parser - set cookies to req.cookies.cookie_name
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Prevent http param pollution
app.use(hpp());

// Enable CORS
const whitelist = ['http://localhost:3000'];
const corsOptions = {
  // origin: function (origin, callback) {
  //   if (whitelist.indexOf(origin) !== -1) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error('Not allowed by CORS'));
  //   }
  // },
  origin: '*',
  credentials: true,
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
}
app.use(cors(corsOptions));

// Use pug as view engine
// app.set('view engine', 'pug');

// make uploads folder publicly available
app.use(`/uploads`, express.static(path.join(__dirname, process.env.BASE_URL, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const breedRoutes = require('./routes/breedRoutes');
const dogRoutes = require('./routes/dogRoutes');
const adoptionRoutes = require('./routes/adoptionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

// Use routes
app.use(`${process.env.BASE_URL}/api/v1/auth`, authRoutes);
app.use(`${process.env.BASE_URL}/api/v1/users`, userRoutes);
app.use(`${process.env.BASE_URL}/api/v1/breed`, breedRoutes);
app.use(`${process.env.BASE_URL}/api/v1/dogs`, dogRoutes);
app.use(`${process.env.BASE_URL}/api/v1/adoptions`, adoptionRoutes);
app.use(`${process.env.BASE_URL}/api/v1/notifications`, notificationRoutes);
app.use(`${process.env.BASE_URL}/api/v1/gallery`, galleryRoutes);

// Use error handler middleware
app.use(errorHandler);

// Define port
const PORT = process.env.PORT || 5000;

// Route not found error
app.use((req, res, next) => {
  return res.status(404).send({ 
    message: 'Route ' + req.url + ' Not found.'
  });
});

// 500 server errors
app.use((err, req, res, next) => {
  return res.status(500).send({ message: err });
});

// Create server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});