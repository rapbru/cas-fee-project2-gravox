import pool from '../data/db-connection.js';

class PositionService {
    constructor(tagService, plcService) {
        this.tagService = tagService;
        this.plcService = plcService;
        this.positions = [];
        this.init();
    }

    async init() {
        this.readPositions();
    }

    async readPositions() {
        this.positions = await PositionService.getDatabasePositions();
    }

    static async getDatabasePositions() {
        const query = 'SELECT * FROM position';
        const result = await pool.query(query);
        return result.rows;
    }

    static async getPositionNumbers() {
        const query = 'SELECT position_number FROM position';
        const result = await pool.query(query);
        return result.rows.map(row => row.position_number);
    }

    async mapPositionData(position) {
        const tagsForPosition = await this.tagService.getTagsForPosition(position.position_number);

        return {
            id: position.id,
            number: position.position_number,
            name: position.position_name,
            flightbar: tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].FB.NBR`)?.value || 0,
            articleName: "Artikel",
            customerName: "Kunde",
            time: {
                actual: (tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].TIME.ACTUAL`)?.value || 0),
                preset: (tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].TIME.PRESET`)?.value || 0),
            },
            temperature: {
                actual: tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].TEMP.ACTUAL1`)?.value || 0,
                preset: tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].TEMP.PRESET`)?.value || 0,
                isPresent: position.has_temperature,
            },
            current: {
                actual: tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].GL.ACTUALAMPS[1]`)?.value || 0,
                preset: tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].GL.PRESETAMPS[1]`)?.value || 0,
                isPresent: position.has_current,
            },
            voltage: {
                actual: tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].GL.ACTUALVOLT[1]`)?.value || 0,
                preset: tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].GL.PRESETVOLT[1]`)?.value || 0,
                isPresent: position.has_voltage,
            },
        };
    }

    async getPositions() {
        const mappedPositions = await Promise.all(
            this.positions.map(async (position) => this.mapPositionData(position))
        );

        return mappedPositions;
    }

    async getPositionById(positionId) {
        const id = Number(positionId);
        const position = this.positions.find(pos => pos.id === id);

        if (!position) {
            return null;
        }

        const mappedPosition = await this.mapPositionData(position);
        return mappedPosition;
    }

    async createPosition(positionData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const query = `
                INSERT INTO position (
                    position_number,
                    position_name,
                    has_temperature,
                    has_current,
                    has_voltage
                ) VALUES ($1, $2, $3, $4, $5) 
                RETURNING id, position_number as number, position_name as name`;
            
            const values = [
                positionData.number,
                positionData.name,
                positionData.temperature?.isPresent ?? true,
                positionData.current?.isPresent ?? true,
                positionData.voltage?.isPresent ?? true
            ];

            const result = await client.query(query, values);
            await client.query('COMMIT');

            this.readPositions();

            if (this.plcService) {
                await this.plcService.subscribeToPosition(positionData.number);
            }

            return {
                ...positionData,
                id: result.rows[0].id
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updatePositions(updates) {
        try {
            await pool.query('BEGIN');

            const query = `
                UPDATE position 
                SET position_number = $1,
                    position_name = $2,
                    has_temperature = $3,
                    has_current = $4,
                    has_voltage = $5
                WHERE id = $6
                RETURNING *`;

            await updates.reduce(async (promise, update) => {
                await promise;
                return pool.query(query, [
                    update.updates.number,
                    update.updates.name,
                    update.updates.temperature.isPresent,
                    update.updates.current.isPresent,
                    update.updates.voltage.isPresent,
                    update.id
                ]);
            }, Promise.resolve());

            await pool.query('COMMIT');
            await this.readPositions();
            
            return true;
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    }

    async deletePositions(positionIds) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Hole alle Positionsnummern für die zu löschenden IDs
            const getQuery = 'SELECT position_number FROM position WHERE id = ANY($1)';
            const posResult = await client.query(getQuery, [positionIds]);
            
            const positionNumbers = posResult.rows.map(row => row.position_number);

            // Lösche alle Positionen in einer Query
            const deleteQuery = 'DELETE FROM position WHERE id = ANY($1)';
            await client.query(deleteQuery, [positionIds]);

            await client.query('COMMIT');

            // Unsubscribe von allen gelöschten Positionen
            if (this.plcService) {
                await Promise.all(positionNumbers.map(number => 
                    this.plcService.unsubscribeFromPosition(number)
                ));
            }

            await this.readPositions();
            
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

export default PositionService;
