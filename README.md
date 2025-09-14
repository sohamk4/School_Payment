# School_Payment

## Project Overview

This project provides a backend solution for managing school payments, built using Node.js, Express, and MongoDB. It handles user authentication, payment processing, and webhook integrations.

## Key Features & Benefits

- **User Authentication:** Secure login and authentication using JWT.
- **Payment Processing:** Integration with payment gateways (implementation details depend on specific payment provider and would be integrated into the controllers).
- **Webhook Handling:** Processes payment status updates via webhooks.
- **Database Management:** Uses MongoDB for storing user data, order information, and webhook logs.
- **Order Management:** Allows for creation and tracking of orders.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

- **Node.js:**  (version >= 14)
- **npm:** (Node Package Manager, usually bundled with Node.js)
- **MongoDB:** A MongoDB instance (local or cloud-based).
- **dotenv:** Module for loading environment variables

## Installation & Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone <repository_url>
   cd School_Payment/backnd
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the `backnd/` directory and define the following environment variables:

   ```
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    JWT_EXPIRES_IN=24h
    PG_API_KEY=your_payment_gateway_api_key
    PG_SECRET_KEY=your_payment_gateway_secret
    SCHOOL_ID=default_school_id
    PORT=3000
    NODE_ENV=development

   ```

   **Note:** Replace the placeholder values with your actual connection string and secret.

4. **Database Setup:**

   Ensure that your MongoDB instance is running and accessible. The `MONGODB_ATLAS_URI` should point to your MongoDB database.

5. **Run the application:**

   ```bash
   npm start
   ```

   This will start the server. The application should now be running on the port specified in your server configuration (typically port 3000 or 5000).

## Usage Examples & API Documentation

### API Endpoints:

- **POST /auth/login:** Logs in a user.
  - Request Body:
    ```json
    {
      "username": "<username>",
      "password": "<password>"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
    }
    ```

- **POST /payment/create:** Creates a payment order. (Requires Authentication)
  - Request Body:
    ```json
    {
      "school_id": "<school_id>",
      "amount": <amount>,
      "student_name": "<student_name>",
      "student_id": "<student_id>"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "order_id": "<order_id>"
    }
    ```
- **POST /webhooks/payment:** Handles payment webhooks.
    - Request Body: (Depends on the integrated payment gateway)
  - Response:
    ```json
    {
        "status": "success"
    }
    ```

### Example usage of protected route:
To access a protected route, you must include a valid JWT in the `Authorization` header as a `Bearer` token.  For example: `Authorization: Bearer <your_jwt_token>`.

## Configuration Options

- **`.env` file:**
  - `MONGODB_ATLAS_URI`: MongoDB connection string.
  - `JWT_SECRET`: Secret key for JWT signing.
  - `APP_NAME`: The name of your application used in JWT claims.
  - `PG_SECRET_KEY`: Default school ID for payment processing.
  - `PG_API_KEY`: Default school ID for payment processing.
  - `SCHOOL_ID`: Default school ID for payment processing.
  - `PORT`: Application environment (development/production).
  - `NODE_ENV`: Application environment (development/production).

## Project Structure

```
└── backnd/
    ├── .gitignore
    ├── .gitkeep
    ├── config/
    │   └── database.js       # MongoDB connection setup
    ├── controllers/
    │   ├── authController.js   # Authentication logic
    │   ├── paymentController.js # Payment processing logic
    │   └── webhookController.js # Webhook handling logic
    ├── middleware/
    │   └── auth.js             # JWT authentication middleware
    ├── models/
    │   ├── OrderStatus.js   # Mongoose model for OrderStatus
    │   ├── Orderr.js    # Mongoose model for Order
    │   ├── User.js             # Mongoose model for User
    │   └── WebhookLog.js   # Mongoose model for WebhookLog
    ├── package-lock.json
    ├── package.json
    └── routes/
        └── auth.js             # Authentication routes
```

## Contributing Guidelines

We welcome contributions to this project! To contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, concise messages.
4.  Submit a pull request to the main branch.

## License Information

This project has no specified license.

## Deployed Application Links

Frontend: https://effervescent-malabi-1d0307.netlify.app/login

Backend(use this link too create payment and test server): https://school-payments-qeob.onrender.com/
