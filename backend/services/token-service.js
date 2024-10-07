import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

class TokenService {
    static generateToken(payload) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
    }
}

export default TokenService;
