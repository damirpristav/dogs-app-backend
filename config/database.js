const mongoose = require('mongoose');

module.exports = async () => {
  try {
    const connURI = process.env.DB_CONNECTION.replace('<password>', process.env.DB_PASS);
    await mongoose.connect(connURI, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  
    console.log('MongoDB connected!');
  } catch (err) {
    console.log(`MongoDB connection failed. Error: ${err.message}`);
  }
}