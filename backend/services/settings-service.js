import pool from '../data/db-connection.js';

class SettingsService {
    constructor() {
        this.defaultSettings = {
            columnCount: 1,
            positionsPerColumn: [0]
        };
    }

    async getColumnSettings() {
        try {
            const query = 'SELECT column_count, positions_per_column FROM column_settings ORDER BY created_at DESC LIMIT 1';
            const result = await pool.query(query);
            return result.rows[0] || this.defaultSettings;
        } catch (error) {
            console.error('Error fetching column settings:', error);
            throw error;
        }
    }

    async saveColumnSettings(settings) {
        try {
            const columnCount = settings?.columnCount ?? this.defaultSettings.columnCount;
            const positionsPerColumn = settings?.positionsPerColumn ?? this.defaultSettings.positionsPerColumn;
            
            console.log('Saving column settings:', settings);
            
            const query = `
                INSERT INTO column_settings (column_count, positions_per_column)
                VALUES ($1, $2)
                RETURNING *
            `;
            const values = [columnCount, positionsPerColumn];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error saving column settings:', error);
            throw error;
        }
    }
}

export default SettingsService;
