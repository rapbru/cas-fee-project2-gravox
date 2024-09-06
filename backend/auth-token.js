import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

const authToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.status(401).json({ error: 'Token required' });
    }

    return jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Token expired' });
            }
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;

        return next();
    });
};

export default authToken;