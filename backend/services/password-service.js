import bcrypt from 'bcryptjs';

class PasswordService {
    static async comparePassword(inputPassword, storedPassword) {
        return bcrypt.compare(inputPassword, storedPassword);
    }
}

export default PasswordService;
