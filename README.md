# Mist Gate API

TypeScript/Express + MongoDB REST API for posts, products, categories, orders, and users.
JWT auth, role-based access, file uploads, rate limiting, and structured logging. Suitable for Docker and optional Cloudflare Tunnel exposure.

## 🚀 Features

- **Auth:** JWT access + refresh, role checks (Admin, Editor)
- **Product Management** CRUD, category population, stock delta updates, image upload/replace
- **Category Management** CRUD with “in use” protection
- **Post Management** Simple CRUD
- **Order System** Stock validation & atomic updates, owner/role-based access
- **CORS:** Strict allowlist for production; dev-friendly options
- **Logging:** Request/event logs with client IP (behind proxies)
- **Rate limits:** Login throttling
- **Docker-ready:** Compose setup; optional Cloudflare Tunnel

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication:**: JWT (access & refresh tokens)
- **Uploads:**: Multer (2 MB limit; JPEG/PNG/GIF/WebP)
- **Environment Configuration:**: dotenv

## 📂 Project Structure

```
mist-server/
├── src/
│ ├── config/        # env/config/constants (roles, shipping, statuses, regex, cors
│ ├── controllers/   # route handlers (auth, users, products, posts, categories, orders)
│ ├── middleware/    # verifyJWT, verifyRoles, rate limiter, credentials, error handler
│ ├── models/        # Mongoose schemas & TS types
│ ├── routes/        # Express routers
│ ├── services/      # business logic (DB ops, auth helpers)
│ ├── utils/         # helpers (order number, validation, etc.)
│ └── server.ts      # app bootstrap
├── public/uploads/images/  # uploaded images (gitignored)
├── logs/                   # request/error logs (created at runtime)
├── .env             # Environment variables
├── .gitignore       # Git ignored files
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md        # Project documentation
```

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ 18 (LTS recommended)
- MongoDB (local or cloud)
- npm ≥ 9

## Installation

1. Clone & install

   ```bash
   git clone https://github.com/Aztaban/mist-server.git <your-repo-folder>
   cd <your-repo-folder>
   npm ci
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```env
   PORT=3500
   DATABASE_URI=<your-database-uri>
   ACCESS_TOKEN_SECRET=<your-jwt-secret>
   REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
   CORS_ORIGINS=<your-allowed-cors-origins>
   STRIPE_API_SECRET=<your-stripe-api-secret>
   COOKIE_SECURE=<true|false>
   TRUST_PROXY=<true|false>
   UPLOAD_DIR:=<your-upload-directory>
   ```

3. Run in development mode:

   ```bash
   npm run dev
   ```

4. Run in production mode:
   ```bash
   npm run build
   npm start
   ```

## 📬 API Endpoints Overview

Base paths have no /api prefix (e.g., /auth, /products, …).

Protect admin/editor routes in the router with verifyJWT then verifyRoles(...).

### 🔐 Auth Routes (`/api/auth`)

- `POST /auth/register` - Register (password policy enforced)
- `POST /auth/login` - Issue access + refresh tokens
- `GET /auth/refresh` - Rotate access token (if enabled)
- `POST /auth/logout` - Invalidate refresh token
- `PUT /user/password` - Change password (current + new)

### 👤 User Routes (`/api/users`)

#### Admin/Editor Only

- `GET /users` – Get all users (`Admin`, `Editor`)
- `GET /users/:id` – Get a specific user by ID (`Admin`)
- `PATCH /users/:id/toggle-status` – Enable/disable user account (`Admin`)
- `PATCH /users/:id/toggle-editor` – Grant/revoke editor role (`Admin`)

#### Authenticated User

- `GET /users` – Get logged-in user's profile
- `GET /users/orders` – Get user's own orders
- `PATCH /users/address` – Update address
- `PATCH /users/phone` – Update phone number
- `PATCH /users/email` – Update email
- `PUT /users/password` – Change password

### 🗂️ Category Routes

#### Public

- `GET /categories` – Retrieve all categories

#### Admin/Editor Only

- `POST /categories` – Create a new category (`Admin`, `Editor`)
- `PATCH /categories/:id` – Update an existing category (`Admin`, `Editor`)
- `DELETE /categories/:id` – Delete a category (`Admin`, `Editor`)

### 📝 Post Routes

#### Public

- `GET /posts` – Get all posts
- `GET /posts/:id` – Get a specific post by ID

#### Admin/Editor Only

- `POST /posts` – Create a new post (`Admin`, `Editor`)
- `PUT /posts/:id` – Update a post (`Admin`, `Editor`)
- `DELETE /posts/:id` – Delete a post (`Admin`)

### 📦 Product Routes (`/api/products`)

#### Public

- `GET /` – Get all products
- `GET /:id` – Get product by ID

#### Admin/Editor Only

- `POST /products` – Create a new product (`Admin`, `Editor`)
- `PATCH /products/:id` – Update a product (`Admin`, `Editor`)
- `POST /products/imageUpload` – Upload a new product image (`Admin`, `Editor`)
- `PUT /products/:id/image` – Replace an existing product image (`Admin`, `Editor`)
- `DELETE /products` – Delete a single product by ID (passed in request body) (`Admin`)

### 🧾 Order Routes

#### Public

- `POST /orders` – Create a new order
- `GET /orders/:id` – Get a specific order by ID
- `PUT /orders/:id/mark-paid` – Mark an order as paid (used after payment)

#### Admin/Editor Only

- `GET /orders` – Get all orders (`Admin`, `Editor`)
- `PATCH /orders/:id` – Update an order status (e.g., shipped, delivered) (`Admin`, `Editor`)
- `DELETE /orders/:id` – Delete an order (`Admin`)

#### Payment

- `POST /orders/:id/payment-intent` – Create a Stripe payment intent for the order

## 🔒 CORS & Security

- Prod: allow only your FE origins (e.g., https://mist-gate.vercel.app).
- Dev: http://localhost:5173, etc.
- CORS uses Origin (the site), not visitor IPs.
- Set trust proxy behind Cloudflare/reverse proxies; log client IP from CF-Connecting-IP/X-Forwarded-For.
- Rate limit sensitive routes (login).
- Validate ObjectIds and request bodies (done in controllers/services).

## 🧰 Logging & Errors

- Logs are written to logs/ with timestamp + UUID.
- Request logger includes method, origin, path, and client IP (when proxied).
- Controllers call next(error); a global error handler maps err.status or defaults to 500.
- Common client errors: 400 Invalid ... id, 409 Category has products, 400 Stock cannot be negative, 401/403 auth failures.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
