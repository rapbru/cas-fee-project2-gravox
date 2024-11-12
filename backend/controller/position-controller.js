import PositionService from '../services/position-service.js';
import TagService from '../plc/tag-service.js';
import PLCMockData from '../data/plc-mock-data.js';

export class PositionController {
    constructor() {
        if (process.env.NODE_ENV === "production") {
            this.tagService = TagService.getInstance();
            this.positionService = new PositionService(this.tagService);
        } else {
            this.positionService = new PLCMockData();
        }
    }

    getAllPositions = async (req, res) => {
        try {
            const positions = await this.positionService.getPositions();
            res.json(positions);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    getPositionById = async (req, res) => {
        const positionId = req.params.id;
        try {
            const position = await this.positionService.getPositionById(positionId);
            res.json(position);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}

export const positionController = new PositionController();
