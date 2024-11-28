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
                actual: (tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].TIME.ACTUAL`)?.value || 0) / 60,
                preset: (tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].TIME.PRESET`)?.value || 0) / 60,
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
                try {
                    await this.plcService.subscribeToPosition(positionData.number);
                } catch (plcError) {
                    console.error('Fehler beim Abonnieren der PLC-Tags:', plcError);
                }
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

            await Promise.all(
                updates.map((update) => {
                    const query = `
                        UPDATE position 
                        SET position_number = $1,
                            position_name = $2,
                            has_temperature = $3,
                            has_current = $4,
                            has_voltage = $5
                        WHERE id = $6
                    `;
                    const values = [
                        update.updates.number,
                        update.updates.name,
                        update.updates.temperature.isPresent,
                        update.updates.current.isPresent,
                        update.updates.voltage.isPresent,
                        update.id
                    ];
                    return pool.query(query, values); 
                })
            );

            this.positions = this.positions.map(pos => {
                const update = updates.find(u => u.id === pos.id);
                if (update) {
                    return {
                        ...pos,
                        position_number: update.updates.number,
                        position_name: update.updates.name,
                        has_temperature: update.updates.temperature.isPresent,
                        has_current: update.updates.current.isPresent,
                        has_voltage: update.updates.voltage.isPresent
                    };
                }
                return pos;
            });

            await pool.query('COMMIT');
            await this.readPositions();
            return true;
        } catch (error) {
            await pool.query('ROLLBACK');
            throw new Error('Failed to update positions: ', error);
        }
    }

    async deletePosition(positionId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const getQuery = 'SELECT position_number FROM position WHERE id = $1';
            const posResult = await client.query(getQuery, [positionId]);
            
            if (posResult.rows.length === 0) {
                throw new Error('Position nicht gefunden');
            }

            const positionNumber = posResult.rows[0].position_number;
            const deleteQuery = 'DELETE FROM position WHERE id = $1';
            await client.query(deleteQuery, [positionId]);
            
            await client.query('COMMIT');

            if (this.plcService) {
                await this.plcService.unsubscribeFromPosition(positionNumber);
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
