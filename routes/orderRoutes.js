import express from 'express';
import Order from '../models/ecommerse/order.models.js';  // Default import

const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('user products');
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get orders by user
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId }).populate('products');
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update order status
router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an order
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
