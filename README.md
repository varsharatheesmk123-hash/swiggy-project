# Swiggy Backend REST API

A scalable, secure, and production-ready RESTful backend API for a food delivery platform built with Node.js, Express, and MongoDB, deployed on Vercel.

## Live Base URL
`https://swiggy-project-seven.vercel.app`

## Tech Stack
* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JSON Web Tokens (JWT) & Passwords Hashing
* **Deployment Platform:** Vercel

## API Endpoints

### Public Endpoints
* `GET /` — API Status Check
* `GET /api/restaurants` — Fetch all restaurants list
* `GET /api/menu/:restaurantId` — Fetch menu items for a specific restaurant

### Protected Endpoints (Requires JWT Auth Header)
* `POST /api/auth/register` — User registration
* `POST /api/auth/login` — User authentication & token issuance
* `GET /api/orders` — User specific order history
* `GET /api/cart` — User cart management
* `POST /api/delivery` — Calculate delivery fees

## Local Setup Instructions
1. Clone repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Set environment variables in `.env`:
   * `MONGO_URI`
   * `JWT_SECRET`
4. Start development server: `npm run dev`
