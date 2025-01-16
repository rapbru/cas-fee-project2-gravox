// controllers/AuthController.js
import AuthService from '../services/auth-service.js';
import AuthMockService from '../services/mock/auth-mock-service.js';

class AuthController {
    static async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }

        try {
            const service = process.env.NODE_ENV === "production" ? AuthService : AuthMockService;
            const result = await service.authenticate(username, password);
            return res.json(result);
        } catch (error) {
            return res.status(401).send('Invalid username or password');
        }
    }
}

export default AuthController;
