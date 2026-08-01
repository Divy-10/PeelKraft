# PeelKraft Premium Sustainable Food Brand - Backend API

This is the Node.js / Express backend server for the **PeelKraft** premium sustainable food brand application. It connects to MongoDB Atlas, utilizes Cloudinary for image hosting, integrates with Razorpay for secure payments, and handles authentication, product management, blog publishing, customer settings, and newsletter operations.

---

## Technical Stack
- **Runtime**: Node.js (v22.x compatibility)
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Security**: Helmet, Express Rate Limit, Express Mongo Sanitize, HPP (HTTP Parameter Pollution protection)
- **Integrations**: Razorpay (Payments), Cloudinary (Media assets), Nodemailer (Transactional email notifications)

---

## Installation & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v18.x or above, v22.x recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and database instance

### 2. Install Dependencies
Navigate to the backend directory and run:
```bash
npm install
```

### 3. Environment Variables Setup
Create a `.env` file in the root of the `backend/` directory and populate it based on `.env.example`:
```ini
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/peelkraft?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP (Nodemailer) Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Admin Seed
ADMIN_EMAIL=admin@peelkraft.com
ADMIN_PASSWORD=PeelKraft@2024

# Razorpay Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## Running Locally

### Start Development Server (with Auto-Reload)
```bash
npm run dev
```

### Start Production Mode Locally
```bash
npm start
```

---

## Deployment Guides

### Heroku Deployment (Manual CLI)

1. **Log in to Heroku CLI**:
   ```bash
   heroku login
   ```

2. **Create the Heroku App**:
   ```bash
   heroku create peelkraft-backend
   ```

3. **Set Production Environment Variables Config Vars**:
   Define variables in the Heroku Dashboard under settings or use the CLI:
   ```bash
   heroku config:set NODE_ENV=production MONGODB_URI=mongodb+srv://... JWT_SECRET=...
   ```

4. **Deploy Code to Heroku**:
   ```bash
   git push heroku main
   ```

5. **Scaling Dynos**:
   Ensure at least one web dyno is running:
   ```bash
   heroku ps:scale web=1
   ```

### GitHub Deployment & CI/CD Pipeline
You can link your GitHub repository to Heroku for automatic deployments:
1. Navigate to the **Deploy** tab of your Heroku Dashboard.
2. Select **GitHub** as the deployment method.
3. Connect your repository and select the branch you wish to deploy (e.g. `main` or `master`).
4. Enable **Automatic Deploys** to trigger deployments on git push.

---

## API Documentation Summary

### Health Check
- **GET** `/api/health` - Checks backend connection and MongoDB status.

### Authentication (`/api/auth`)
- **POST** `/api/auth/register` - Create user account
- **POST** `/api/auth/login` - Authenticate user & get JWT token

### E-commerce & Orders
- **GET/POST** `/api/products` - Retrieve or create products
- **POST** `/api/orders` - Initialize customer order
- **POST** `/api/payments/verify` - Verify Razorpay payment signature
