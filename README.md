# Mist Server

This is the backend for the Mist Gate eCommerce project, called **Mist Server**. It is a practice project to gain experience and improve skills in backend development. Built using **TypeScript** and **Express**, it provides robust APIs for managing users, products, orders, authentication, and more. Mist Server is designed for scalability, security, and ease of use.

## Features

- User authentication and authorization (JWT-based).
- RESTful APIs for:
  - Product management
  - Order management
- Admin controls for managing orders and products.
- Secure handling of sensitive data (e.g., `httpOnly` cookies for refresh tokens).
- Supports MongoDB (or SQL databases for production setups).
- Scalable architecture with clear separation of concerns.

## Technologies Used

- **Node.js** with **Express** for the backend framework.
- **TypeScript** for type safety and cleaner code.
- **MongoDB** as the database (supports SQL for production).
- **JWT** for secure authentication.
- **dotenv** for managing environment variables.
- **Mongoose** (or **TypeORM** for SQL-based setups).

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

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

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user.
- `POST /auth/login` - Log in a user and return access/refresh tokens.
- `POST /auth/refresh` - Refresh the access token.
- `POST /auth/logout` - Log out the user.

### Products
- `GET /products` - Get a list of products.
- `GET /products/:id` - Get a product by ID.
- `POST /products` - Add a new product (Admin only).
- `PUT /products/:id` - Update a product (Admin only).
- `DELETE /products` - Delete a product (Admin only).
- `DELETE /products/imageUpload` - Upload product image (Admin only).

### Orders
- `GET /orders` - Get all orders (Admin only).
- `POST /orders` - Create a new order.
- `GET /orders/user` - Get orders for the logged-in user.
- `GET /orders/:id` - Return order.
- `PUT /orders/:id` - Update order (Admin only).
- `DELETE /orders/:id` - Deletes order. (Admin only).
- `PUT /orders/:id/status` - Update order status (Admin only).
- `PUT /orders/:id/shipping` - Update Shipping method (Admin only).
- `PUT /orders/:id/mark-paid` - Mark Order as Paid.
- `PUT /orders/:id/payment-intent` - Create payment intent for order (Admin only).

## Folder Structure

```plaintext
src/
├── config/             # Configuration files
├── controllers/        # Route handlers
├── middleware/         # Custom middleware
├── models/             # Mongoose/TypeORM models
├── routes/             # API route definitions
├── utils/              # Utility functions
├── server.ts           # Server setup
```

## Contribution

Contributions are welcome! Please fork the repository and create a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
