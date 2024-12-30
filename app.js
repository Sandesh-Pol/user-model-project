import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import categoryRoutes from './routes/categoryRoutes.js';  // Use .js extension
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoures.js';

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
