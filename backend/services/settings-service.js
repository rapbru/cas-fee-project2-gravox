import pool from '../data/db-connection.js';
import logger from '../utils/logger.js';

class SettingsService {
    constructor() {
        this.pool = pool;
        this.defaultSettings = {
            columnCount: 1,
            positionsPerColumn: [0]
        };
    }

    async getColumnSettings() {
        try {
            const query = 'SELECT column_count, positions_per_column FROM column_settings ORDER BY created_at DESC LIMIT 1';
            const result = await this.pool.query(query);
            return result.rows[0] || this.defaultSettings;
        } catch (error) {
            logger.error('Error fetching column settings:', error);
            throw error;
        }
    }

    async saveColumnSettings(settings) {
        try {
            const columnCount = settings?.columnCount ?? this.defaultSettings.columnCount;
            const positionsPerColumn = settings?.positionsPerColumn ?? this.defaultSettings.positionsPerColumn;
            
            logger.info('Saving column settings:', settings);
            
            const query = `
                INSERT INTO column_settings (column_count, positions_per_column)
                VALUES ($1, $2)
                RETURNING *
            `;
            const values = [columnCount, positionsPerColumn];
            const result = await this.pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            logger.error('Error saving column settings:', error);
            throw error;
        }
    }

    async getPositionOrder() {
        try {
            const query = 'SELECT position_id, order_index FROM position_order ORDER BY order_index';
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            logger.error('Error fetching position order:', error);
            throw error;
        }
    }

    async savePositionOrder(positions) {
        try {
            await this.pool.query('BEGIN');
            
            logger.info('Deleting existing position order...');
            const deleteResult = await this.pool.query('DELETE FROM position_order');
            logger.info(`Deleted ${deleteResult.rowCount} existing position order entries`);

            logger.info('Positions to save:', positions);
            
            // Erstelle die Werte für den Bulk-Insert
            const values = positions.map((positionId, index) => 
                `(${positionId}, ${index})`
            ).join(',');
            
            // Führe einen einzelnen Bulk-Insert aus
            const insertQuery = `
                INSERT INTO position_order (position_id, order_index) 
                VALUES ${values}
            `;
            
            await this.pool.query(insertQuery);
            await this.pool.query('COMMIT');
            
            logger.info('Successfully saved all position orders');
        } catch (error) {
            await this.pool.query('ROLLBACK');
            logger.error('Error in savePositionOrder:', error);
            throw error;
        }
    }
}

export default SettingsService;
