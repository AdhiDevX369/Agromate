const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/agromate',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'agromate_secret_key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  // Weather API configuration (for the Weather feature)
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
  WEATHER_API_URL: process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',
  
  // Validation constants
  MIN_PASSWORD_LENGTH: 8,
};