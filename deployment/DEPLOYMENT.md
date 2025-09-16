# Deployment Guide

This guide provides instructions for deploying the Shopify Data Ingestion & Insights Service to various platforms.

## Heroku Deployment

### Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- Heroku account
- Git repository with your project

### Steps

1. Login to Heroku:
   ```
   heroku login
   ```

2. Create a new Heroku app:
   ```
   heroku create xeno-shopify-insights
   ```

3. Add PostgreSQL add-on:
   ```
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. Set environment variables:
   ```
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secure_jwt_secret
   heroku config:set JWT_EXPIRES_IN=24h
   heroku config:set SYNC_INTERVAL_MINUTES=60
   ```

5. Deploy the application:
   ```
   git push heroku main
   ```

6. Open the application:
   ```
   heroku open
   ```

## Railway Deployment

### Prerequisites

- Railway account
- Git repository with your project

### Steps

1. Create a new project in Railway dashboard
2. Add a PostgreSQL database service
3. Add a Node.js service and connect it to your GitHub repository
4. Set environment variables in the Railway dashboard:
   - `NODE_ENV=production`
   - `JWT_SECRET=your_secure_jwt_secret`
   - `JWT_EXPIRES_IN=24h`
   - `SYNC_INTERVAL_MINUTES=60`
   - Database variables will be automatically set
5. Deploy the application

## Render Deployment

### Prerequisites

- Render account
- Git repository with your project

### Steps

1. Create a new Web Service in Render dashboard
2. Connect to your GitHub repository
3. Set the build command: `npm install && npm run build`
4. Set the start command: `npm start`
5. Add a PostgreSQL database service
6. Set environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your_secure_jwt_secret`
   - `JWT_EXPIRES_IN=24h`
   - `SYNC_INTERVAL_MINUTES=60`
   - Database variables from the PostgreSQL service
7. Deploy the application

## Docker Deployment

### Prerequisites

- Docker and Docker Compose installed
- Git repository with your project

### Steps

1. Build the Docker image:
   ```
   docker-compose build
   ```

2. Start the services:
   ```
   docker-compose up -d
   ```

3. Access the application at `http://localhost:3000`

## Environment Variables

The following environment variables need to be set for production deployment:

- `NODE_ENV`: Set to `production`
- `PORT`: The port the server will run on (default: 3000)
- `DB_HOST`: PostgreSQL database host
- `DB_PORT`: PostgreSQL database port (default: 5432)
- `DB_NAME`: PostgreSQL database name
- `DB_USER`: PostgreSQL database user
- `DB_PASSWORD`: PostgreSQL database password
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRES_IN`: JWT token expiration time (e.g., `24h`)
- `SYNC_INTERVAL_MINUTES`: Interval for data synchronization (default: 60)

## SSL Configuration

For production deployments, it's recommended to enable SSL. Most platforms like Heroku, Railway, and Render provide SSL by default.

## Custom Domain Configuration

To use a custom domain:

1. Purchase a domain name from a domain registrar
2. Configure DNS settings to point to your deployment platform
3. Set up the custom domain in your deployment platform's dashboard
4. Enable SSL for your custom domain
