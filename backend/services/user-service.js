import pool from '../data/db-connection.js';

class UserService {
    static async findUserByUsername(username) {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    }
}

export default UserService;
