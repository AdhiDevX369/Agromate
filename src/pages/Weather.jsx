import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const API_KEY = '94e38c38bab65605ae3a7959c75dc1ae';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        const [weatherRes, forecastRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`),
          axios.get(`${API_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`)
        ]);

        setWeather(weatherRes.data);
        setForecast(forecastRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Failed to fetch weather data. Please try again later.');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="rounded-full h-16 w-16 border-4 border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[600px]"
      >
        <p className="text-red-500 bg-red-50 px-6 py-4 rounded-lg shadow-sm">{error}</p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Current Weather */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-shadow duration-300"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              Current Weather
            </motion.h1>
            <motion.div 
              className="flex items-center mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src={`https://openweathermap.org/img/wn/${weather?.weather[0].icon}@2x.png`}
                alt={weather?.weather[0].description}
                className="w-20 h-20"
              />
              <div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-4xl font-bold text-gray-900"
                >
                  {Math.round(weather?.main.temp)}°C
                </motion.p>
                <p className="text-lg text-gray-600 capitalize">{weather?.weather[0].description}</p>
              </div>
            </motion.div>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: "Humidity", value: `${weather?.main.humidity}%` },
              { label: "Wind Speed", value: `${weather?.wind.speed} m/s` },
              { label: "Feels Like", value: `${Math.round(weather?.main.feels_like)}°C` },
              { label: "Pressure", value: `${weather?.main.pressure} hPa` }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                variants={item}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-300"
              >
                <p className="text-gray-600">{item.label}</p>
                <p className="text-2xl font-semibold">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* 5-Day Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
      >
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-gray-900 mb-6"
        >
          5-Day Forecast
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {forecast?.list
            .filter((item, index) => index % 8 === 0)
            .map((item, index) => (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-300"
              >
                <p className="text-gray-600 mb-2">
                  {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <motion.img 
                  whileHover={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5 }}
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                  alt={item.weather[0].description}
                  className="w-16 h-16 mx-auto"
                />
                <p className="text-xl font-semibold text-center">
                  {Math.round(item.main.temp)}°C
                </p>
                <p className="text-gray-600 text-sm text-center capitalize">
                  {item.weather[0].description}
                </p>
              </motion.div>
            ))}
        </motion.div>
      </motion.div>
    </div>
  );
}