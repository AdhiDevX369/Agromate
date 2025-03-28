# AgroMate Farmers Data Management System (FDMS)

<div align="center">
  <img src="public/agromate.svg" alt="Farmer's Assistant Logo" width="200" height="200"/>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
</div>

A comprehensive data management solution for farmers to track crops, manage agricultural activities, monitor finances, access market information, and get weather forecasts.

## Features

- **User Authentication**: Secure login and registration system with role-based access control
- **Farmer Dashboard**: Overview of farm activities, crops, and financial status
- **Admin Dashboard**: User management and system monitoring
- **Crop Management**: Track planting, growth, and harvesting of crops
- **Market Information**: Access current market prices for agricultural products
- **Weather Data**: Get weather forecasts for making informed farming decisions
- **Financial Tracking**: Record income, expenses, and overall financial health

## Technologies Used

### Frontend
- React
- React Router
- Tailwind CSS
- Axios for API requests
- Framer Motion for animations

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- RESTful API architecture

## Getting Started

### Prerequisites

- <img src="https://nodejs.org/static/images/logo.svg" width="16" height="16"/> Node.js (v14 or higher)
- MongoDB (local or Atlas connection string)
- <img src="https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.svg" width="16" height="16"/> npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd agromate-fdms
```

2. Create a .env file in the root directory with the following variables:
```
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
WEATHER_API_KEY=your_openweather_api_key
```

3. Install dependencies for server and client
```bash
npm run install-all
```

### Running the Application

#### Development mode
```bash
# Run both client and server in development mode
npm run dev

# Run only the backend server
npm run server

# Run only the frontend client
npm run client
```

#### Production mode
```bash
# Build the client
npm run build

# Start the production server
npm start
```

### Creating an Admin User

Use the provided script to create a super admin user:
```bash
npm run create-admin
```

This will create an admin user with the default credentials (can be overridden via environment variables):
- Email: admin@agromate.com
- Password: Admin@123

## API Documentation

The API is organized around REST principles. All endpoints return JSON responses.

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

- `POST /auth/register`: Register a new user
- `POST /auth/login`: Login a user
- `GET /auth/me`: Get current authenticated user

### Farmer Endpoints

- `GET /dashboard/farmer`: Get farmer dashboard data
- `GET /dashboard/farmer/crops`: Get all crops for the farmer
- `POST /dashboard/farmer/crops`: Add a new crop
- `PUT /dashboard/farmer/profile`: Update farmer profile

### Admin Endpoints

- `GET /admin/dashboard`: Get admin dashboard data
- `GET /admin/users`: Get all users
- `POST /admin/users`: Create a new user
- `PUT /admin/users/:id`: Update a user
- `DELETE /admin/users/:id`: Delete a user
- `GET /admin/crops`: Get all crops across all farmers

## Future Enhancements

- Mobile application
- Offline capability
- Integration with IoT devices
- AI-powered crop recommendations
- Marketplace for direct sales

## Project Structure

The project follows a client-server architecture with clear separation of concerns:

```
agromate-fdms/
├── client/               # Frontend React application
│   ├── public/           # Static assets
│   └── src/
│       ├── api/          # API service layer
│       ├── assets/       # Images and other assets
│       ├── components/   # Reusable UI components
│       ├── constants/    # Constant values and data
│       ├── contexts/     # React contexts (Auth, etc.)
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # React components for routes
│       └── utils/        # Utility functions
├── server/               # Backend Express application
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API route handlers
│   ├── scripts/          # Utility scripts
│   └── utils/            # Server utility functions
└── .env                  # Environment variables
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
<div align="center">
  Made with ❤️ for farmers everywhere
</div>