import UserService from './user-service.js';
import PasswordService from './password-service.js';
import TokenService from './token-service.js';

class AuthService {
    static async authenticate(username, password) {
        const user = await UserService.findUserByUsername(username);

        if (!user) {
            throw new Error('Invalid username or password');
        }

        const match = await PasswordService.comparePassword(password, user.password);

        if (!match) {
            throw new Error('Invalid username or password');
        }

        const token = TokenService.generateToken({ userId: user.id });
        return { token };
    }
}

export default AuthService; 