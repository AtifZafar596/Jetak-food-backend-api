require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { logger, errorLogger } = require('./middleware/logger');

// Import routes
const authRoutes = require('./routes/api/v1/auth.routes');
const adminAuthRoutes = require('./routes/api/v1/admin.auth.routes');
const adminOrderRoutes = require('./routes/api/v1/admin.order.routes');
const categoryRoutes = require('./routes/api/v1/category.routes');
const storeRoutes = require('./routes/api/v1/store.routes');
const locationRoutes = require('./routes/api/v1/location.routes');
const orderRoutes = require('./routes/api/v1/order.routes');
const adminCategoryRoutes = require('./routes/api/v1/admin.category.routes');
const adminStoreRoutes = require('./routes/api/v1/admin.store.routes');
const adminMenuRoutes = require('./routes/api/v1/admin.menu.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(logger);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "AA Food Delivery API Documentation"
}));

// API Routes
// app.use("/",(req,res)=>{
//   res.send("Api is working");
// })

app.use('/api/auth', authRoutes);
app.use('/admin/api/auth', adminAuthRoutes);
app.use('/admin/api', adminOrderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/admin/api', adminCategoryRoutes);
app.use('/admin/api', adminStoreRoutes);
app.use('/admin/api', adminMenuRoutes);

// Error handling middleware
app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Global Error Handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('\n🚀 Server started successfully!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  console.log(`⏰ Server start time: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 