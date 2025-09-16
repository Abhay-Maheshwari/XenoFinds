const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./config/prisma');
const schedulerService = require('./services/scheduler.service');
require('dotenv').config();
const tenantRoutes = require('./routes/tenant.routes');
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const orderRoutes = require('./routes/order.routes');
const productRoutes = require('./routes/product.routes');
const customEventRoutes = require('./routes/customEvent.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/tenants', tenantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/events', customEventRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Shopify Data Ingestion & Insights Service API' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        
        if (process.env.NODE_ENV !== 'test') {
          schedulerService.start();
        }
        console.log('✅ Scheduler enabled for Shopify sync');
      });
    } else {
      console.error('Server not started due to database connection failure');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();

module.exports = app;
