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

    async mapPositionData(position) {
        const tagsForPosition = await this.tagService.getTagsForPosition(position.position_number);

        return {
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
        const position = this.positions.find(pos => pos.position_number === id);

        if (!position) {
            return null;
        }

        const mappedPosition = await this.mapPositionData(position);
        return mappedPosition;
    }
}

export default PositionService;
