import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/ecommerse/user.models.js'; // Use ES Module import

const router = express.Router();

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret'; // Replace with a secure key from .env

/**
 * User Sign-Up
 */
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * User Login
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Get User Profile (Protected Route)
 */
router.get('/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    try {
        if (!token) {
            return res.status(401).json({ message: 'Access denied, no token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Update User Profile (Protected Route)
 */
router.put('/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { name, email, password } = req.body;

    try {
        if (!token) {
            return res.status(401).json({ message: 'Access denied, no token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.status(200).json({ message: 'User profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Delete User Account (Protected Route)
 */
router.delete('/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    try {
        if (!token) {
            return res.status(401).json({ message: 'Access denied, no token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(decoded.userId);
        res.status(200).json({ message: 'User account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;  // Use export default for ES Modules
