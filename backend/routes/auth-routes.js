import express from 'express';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; 
import pool from '../data/db.js';

dotenv.config();

const router = express.Router();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).send('Invalid username or password');
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

        return res.json({ token });

    } catch (error) {
        console.error('Error during authentication:', error);
        return res.status(500).send('Internal Server Error');
    }
});

export default router;
