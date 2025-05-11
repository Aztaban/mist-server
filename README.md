# Mist Server

**Mist Server** is the backend for the Mist Gate eCommerce project. Built with **TypeScript**, **Express.js**, and **MongoDB**, it provides a modular and scalable REST API for managing users, products, categories, orders, and authentication.

## 🚀 Features

- **User Authentication & Authorization** using JWT and role-based access control
- **Product Management** with support for stock updates and category linking
- **Category Management** for clean and organized product classification
- **Order System** with user association and status tracking
- **Admin Controls** to manage users, products, and orders
- **Security** using `httpOnly` cookies and clean input handling
- **Modular Code Structure** for easy maintenance and extension

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (access & refresh tokens)
- **Environment Configuration**: dotenv

## 📂 Project Structure

```
mist-server/
├── src/
│ ├── config/ # Environment config and constants
│ ├── controllers/ # Route handler functions
│ ├── middleware/ # Auth, error handling, etc.
│ ├── models/ # Mongoose schemas and interfaces
│ ├── routes/ # Express route definitions
│ ├── services/ # Business logic (database interaction)
│ ├── utils/ # Helper functions/utilities
│ └── server.ts # Entry point for starting the server
├── .env # Environment variables
├── .gitignore # Git ignored files
├── package.json # Project metadata and scripts
├── tsconfig.json # TypeScript configuration
└── README.md # Project documentation
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

````

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```env
   PORT=3500
   DATABASE_URI=<your-database-uri>
   ACCESS_TOKEN_SECRET=<your-jwt-secret>
   REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
   STRIPE_API_SECRET=<your-stripe-api-secret>
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## 📬 API Endpoints Overview

### 🔐 Auth Routes (`/api/auth`)

- `POST /auth/register` - Register a new user.
- `POST /auth/login` - Log in a user and return access/refresh tokens.
- `POST /auth/refresh` - Refresh the access token.
- `POST /auth/logout` - Log out the user.

### 👤 User Routes (`/api/users`)

#### Admin/Editor Only

- `GET /` – Get all users (`Admin`, `Editor`)
- `GET /:id` – Get a specific user by ID (`Admin`)
- `PATCH /:id/toggle-status` – Enable/disable user account (`Admin`)
- `PATCH /:id/toggle-editor` – Grant/revoke editor role (`Admin`)

#### Authenticated User

- `GET /user` – Get logged-in user's profile
- `GET /user/orders` – Get user's own orders
- `PATCH /user/address` – Update address
- `PATCH /user/phone` – Update phone number
- `PATCH /user/email` – Update email
- `PUT /user/password` – Change password

### 🗂️ Category Routes (`/api/categories`)

#### Public

- `GET /` – Retrieve all categories

#### Admin/Editor Only

- `POST /` – Create a new category (`Admin`, `Editor`)
- `PATCH /:id` – Update an existing category (`Admin`, `Editor`)
- `DELETE /:id` – Delete a category (`Admin`, `Editor`)

### 📝 Post Routes (`/api/posts`)

#### Public

- `GET /` – Get all posts
- `GET /:id` – Get a specific post by ID

#### Admin/Editor Only

- `POST /` – Create a new post (`Admin`, `Editor`)
- `PUT /:id` – Update a post (`Admin`, `Editor`)
- `DELETE /:id` – Delete a post (`Admin`)

### 📦 Product Routes (`/api/products`)

#### Public

- `GET /` – Get all products
- `GET /:id` – Get product by ID

#### Admin/Editor Only

- `POST /` – Create a new product (`Admin`, `Editor`)
- `PATCH /:id` – Update a product (`Admin`, `Editor`)
- `POST /imageUpload` – Upload a new product image (`Admin`, `Editor`)
- `PUT /:id/image` – Replace an existing product image (`Admin`, `Editor`)
- `DELETE /` – Delete a single product by ID (passed in request body) (`Admin`)

### 🧾 Order Routes (`/api/orders`)

#### Public

- `POST /` – Create a new order
- `GET /:id` – Get a specific order by ID
- `PUT /:id/mark-paid` – Mark an order as paid (used after payment)

#### Admin/Editor Only

- `GET /` – Get all orders (`Admin`, `Editor`)
- `PATCH /:id` – Update an order status (e.g., shipped, delivered) (`Admin`, `Editor`)
- `DELETE /:id` – Delete an order (`Admin`)

#### Payment

- `POST /:id/payment-intent` – Create a Stripe payment intent for the order

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
````
