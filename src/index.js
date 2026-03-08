require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// Import routes
const categoryRoutes = require('./routes/categoryRoutes');
const proposalRoutes = require('./routes/proposalRoutes');

const app = express();

// Connect to MongoDB mapping only when running normally, not in tests if not needed
// We can handle conditionally connecting inside db.js, but let's just connect if not test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(express.json());

// Routes
app.use('/api/category', categoryRoutes);
app.use('/api/proposal', proposalRoutes);

// Healthcheck
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Start server
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for testing
module.exports = app;
