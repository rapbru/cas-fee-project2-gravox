import pool from '../data/db-connection.js';

class PositionService {
    constructor(tagService) {
        this.tagService = tagService;
        this.positions = [];
        this.init();
    }

    async init() {
        this.positions = await PositionService.getPositions();
    }

    static async getPositions() {
        const query = 'SELECT * FROM position';
        const result = await pool.query(query);
        return result.rows;
    }

    static mapPositionData(position, tagsForPosition) {
        // console.log("tagsForPosition");
        // console.log(tagsForPosition);
        return {
            name: position.position_name,
            flightbar: tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].FB.NBR`)?.value || 0,
            articleName: "Artikel",
            customerName: "Kunde",
            time: {
                actual: tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].TIME.ACTUAL`)?.value || 0,
                preset: tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].TIME.PRESET`)?.value || 0,
            },
            temperature: {
                actual: tagsForPosition.find(tag => tag.tag === `POS[${position.position_number}].TEMP.ACTUAL`)?.value || 0,
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
        const results = {};
        await Promise.all(this.positions.map(async (position) => {
            const tagsForPosition = await this.tagService.getTagsForPosition(position.position_number);
            results[position.position_number] = PositionService.mapPositionData(position, tagsForPosition);
        }));

        return { positions: results };
    }

    async getPositionById(positionId) {
        const position = this.positions.find(p => p.positionNumber === positionId);
        const results = {};

        if (!position) {
            return { positions: {} };
        }

        await Promise.all(position.map(async (pos) => {
            const tagsForPosition = await this.tagService.getTagsForPosition(pos.positionNumber);
            results[pos.positionNumber] = PositionService.mapPositionData(pos, tagsForPosition);
        }));

        return { positions: results };
    }
}

export default PositionService;
