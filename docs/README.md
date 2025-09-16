# Shopify Data Ingestion & Insights Service - Backend

This is the backend service for the Xeno FDE Internship Assignment. It provides a multi-tenant API for ingesting and analyzing Shopify store data.

## Features

- Multi-tenant architecture with data isolation
- Shopify API integration for data ingestion
- Authentication and authorization
- RESTful API endpoints for customers, orders, and products
- Scheduled data synchronization
- Custom event tracking (cart abandoned, checkout started)

## Tech Stack

- Node.js with Express.js
- PostgreSQL database
- Sequelize ORM
- JWT for authentication
- Shopify API Node.js client

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a PostgreSQL database:
   ```
   createdb shopify_data
   ```
4. Copy the `.env.example` file to `.env` and update the values:
   ```
   cp .env.example .env
   ```
5. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new tenant
- `POST /api/auth/login` - Login a tenant
- `GET /api/auth/profile` - Get current tenant profile
- `PUT /api/auth/shopify-credentials` - Update Shopify API credentials

### Tenants

- `POST /api/tenants/sync` - Sync data for the current tenant
- `GET /api/tenants/dashboard-stats` - Get dashboard statistics
- `PUT /api/tenants/profile` - Update tenant profile
- `PUT /api/tenants/change-password` - Change tenant password

### Customers

- `GET /api/customers` - Get all customers
- `GET /api/customers/top` - Get top customers by spending
- `GET /api/customers/stats` - Get customer statistics
- `GET /api/customers/:id` - Get a customer by ID

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/by-date` - Get orders by date range
- `GET /api/orders/stats` - Get order statistics
- `GET /api/orders/:id` - Get an order by ID

### Products

- `GET /api/products` - Get all products
- `GET /api/products/stats` - Get product statistics
- `GET /api/products/:id` - Get a product by ID

### Custom Events (Bonus Feature)

- `GET /api/events` - Get all custom events
- `GET /api/events/stats` - Get event statistics
- `POST /api/events/webhook` - Create a webhook event

## Data Synchronization

The service includes a scheduler that automatically syncs data from Shopify at regular intervals. The sync interval can be configured in the `.env` file.

## Error Handling

All API endpoints include proper error handling and return appropriate HTTP status codes and error messages.

## Security

- JWT authentication for API endpoints
- Password hashing with bcrypt
- CORS and Helmet middleware for security headers
