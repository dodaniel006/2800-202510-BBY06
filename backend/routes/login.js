/**
 * Exported functions:
 * - ensureLoggedIn: Middleware to check if the user is logged in
 *   if not, redirects to the login page
 * 
 */


import { Router } from 'express';
import User from '../config/db_schemas/User.js';
import 'dotenv/config'; // Load environment variables from .env file

// Store session data with mongoDB
import session from 'express-session';
import MongoStore from 'connect-mongo';
const TTL = 60 * 60 // 1 hour

const loginRouter = Router();

// authentication middleware
function ensureLoggedIn(req, res, next) {
    if (req.session.authenticated) {
        return next(); // authenticated, go to next middleware
    } else {
        res.redirect('/login')
    }
}

export { ensureLoggedIn };


// Session store setup
const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: TTL,
    autoRemove: 'native', // Use native MongoDB TTL index
    dbName: 'Japples',
    collectionName: 'sessions',
    crypto: {
        secret: process.env.SESSION_SECRET
    }
});

// TODO: Router middleware to use session store
loginRouter.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: TTL * 1000, // Converted to milliseconds
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    },
}))

// TODO: Joi validation for login data


// POST /api/auth/login
loginRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;


    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }


    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.'});
        }

        const isPassMatch = await user.comparePassword(password);
        if (isPassMatch) {
            // Login success
            // TODO hadnle session stuffs
            req.session.authenticated = true;
            req.session.userId = user._id; // Store user ID in session
            req.session.email = user.email; // Store email in session
            req.session.username = user.username; // Store username in session
            req.session.cookie.maxAge = TTL * 1000; // Set cookie max age to 1 hour

            res.status(200).json({ message: 'Login success', userId: user._id})
            
        } else {
            return res.status(401).json({ message: 'Invalid credentials.'})
        }
        
        

    } catch (error) {
        console.error('Server login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});