// controllers/AuthController.js
import UserService from '../services/user-service.js';
import PasswordService from '../services/password-service.js';
import TokenService from '../services/token-service.js';

class AuthController {
    static async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }

        try {
            const user = await UserService.findUserByUsername(username);

            if (!user) {
                return res.status(401).send('Invalid username or password');
            }

            const match = await PasswordService.comparePassword(password, user.password);

            if (!match) {
                return res.status(401).send('Invalid username or password');
            }

            const token = TokenService.generateToken({ userId: user.id });

            return res.json({ token });

        } catch (error) {
            console.error('Error during authentication:', error);
            return res.status(500).send('Internal Server Error');
        }
    }
}

export default AuthController;
