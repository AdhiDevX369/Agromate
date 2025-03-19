# AgroMate Farmers Data Management System (FDMS) Development Prompt

Your task is to develop the **AgroMate Farmers Data Management System** for Sri Lankan farmers. This web-based application should be built using **React.js** for frontend, **Node.js/Express.js** for backend, and **MongoDB** for database storage.

## System Requirements

### Core Framework
1. Implement a secure, role-based web application with distinct interfaces for farmers and administrators
2. Ensure responsive design that works on desktop and mobile devices
3. Create RESTful API endpoints for all features described below

### User Authentication System
1. Create a registration system for farmers only (admins cannot self-register)
2. Implement a login system with JWT authentication
3. Configure a role-based system with three levels:
    - Farmers (role: 0)
    - Admins (role: 1)
    - Super Admin (role: 2) who can create other admins
4. Build a farmer approval workflow where admins must approve new registrations

### Farmer Module
1. Design a profile management system for farmers to track:
    - Personal details (name, contact information)
    - Farm details (size, location)
    - Crops grown
2. Create a dashboard showing:
    - Weather data from external API based on location
    - Summary of crops and finances
    - Notifications
3. Build a crop management interface to track:
    - Crop types and quantities
    - Planting and expected harvest dates
    - Status (growing, harvested, sold)

### Finance Module
1. Develop a transaction logging system for:
    - Income recording
    - Expense tracking
    - Profit calculation
2. Create reporting views with filters for date ranges

### Market Price Module
1. Build an interface for admins to update crop prices
2. Implement a notification system to alert farmers of price changes
3. Create a view for farmers to browse current market prices

### Admin Module
1. Design an admin dashboard showing:
    - System metrics (user counts, pending approvals)
    - Recent activities
2. Create interfaces for:
    - Managing farmer approvals
    - Viewing and modifying farmer profiles
    - Updating market prices
3. For Super Admin only, add functionality to create new admin accounts

### Database Structure
Implement the following MongoDB collections exactly as specified:

1. **Users Collection**:
    - `_id`, `email`, `password` (hashed), `role`, `status`, `name`, `location`, `createdAt`, `updatedAt`

2. **Farmers Collection**:
    - `_id`, `userId`, `farmName`, `farmSize`, `cropsGrown`, `contactNumber`, `address`, `profileUpdatedAt`

3. **Crops Collection**:
    - `_id`, `userId`, `cropType`, `quantity`, `expectedHarvestDate`, `status`, `createdAt`, `updatedAt`

4. **MarketPrices Collection**:
    - `_id`, `cropType`, `price`, `date`, `updatedBy`, `createdAt`, `updatedAt`

5. **Transactions Collection**:
    - `_id`, `userId`, `type`, `amount`, `description`, `date`, `createdAt`, `updatedAt`

6. **Notifications Collection**:
    - `_id`, `userId`, `message`, `type`, `read`, `createdAt`

### Security Requirements
1. Implement password hashing using bcryptjs
2. Create middleware for role-based access control
3. Set up data validation for all inputs
4. Configure proper error handling throughout the application
5. Ensure only super admin can create admin accounts

### Additional Features
1. Integrate a weather API to display forecasts based on farmer location
2. Create an automated notification system for price changes and announcements
3. Implement data export functionality for reports

## Implementation Notes
- Initialize the system with one super admin account
- Apply proper input validation across all forms
- Design with Sri Lankan agricultural context in mind
- Ensure all API endpoints have proper authentication
- Include comprehensive documentation for API endpoints

Begin implementing these requirements, focusing first on the core authentication and user management features.
