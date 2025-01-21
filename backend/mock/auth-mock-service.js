import TokenService from '../services/token-service.js';

class AuthMockService {
    static mockUsers = [
        {
            id: 1,
            username: 'user',
            password: 'Ultra5ecurePW$'
        },
        {
            id: 2,
            username: 'admin',
            password: 'password'
        }
    ];

    static async authenticate(username, password) {
        const user = this.mockUsers.find(u => u.username === username && u.password === password);
        
        if (user) {
            const token = TokenService.generateToken({ userId: user.id });
            return {
                success: true,
                token
            };
        } 

        throw new Error('Invalid username or password');
    }
}

export default AuthMockService; 