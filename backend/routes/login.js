import { Router } from 'express';
import User from '../config/db_schemas/User.js';
import session from 'express-session';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;


    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }


    try {
        const user = await User.findOne({ email});

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.'});
        }

        const isPassMatch = await user.comparePassword(password);

        if (!isPassMatch) {
            return res.status(401).json({ message: 'Invalid credentials.'})
        }

        // Login success
        // TODO hadnle session stuffs

        res.status(200).json({ message: 'Login success', userId: user._id})

    } catch (error) {
        console.error('Server login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});