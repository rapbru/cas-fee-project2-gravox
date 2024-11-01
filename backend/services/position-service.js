import pool from '../data/db-connection.js';

class PositionService {
    constructor(plcService) {
        this.plcService = plcService;
    }

    static async getPositions() {
        const query = 'SELECT * FROM positions';
        const result = await pool.query(query);
        return result.rows;
    }

    async mapPositionData() {
        const positions = await this.getPositions();
        const mappedPositions = await Promise.all(positions.map(async (position) => {
            const tagValue = await this.plcService.tagService.getTagData(position.tagName);
            return {
                positionNumber: position.positionNumber,
                name: position.name,
                controlInfo: {
                    tagName: position.tagName,
                    value: tagValue.value,
                },
            };
        }));
        return mappedPositions;
    }
}

export default PositionService;
