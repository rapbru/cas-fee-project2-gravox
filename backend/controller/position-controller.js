import PositionService from '../services/position-service.js';
import TagService from '../plc/tag-service.js';
import PLCService from '../plc/plc-service.js';
import PositionMockService from '../mock/position-mock-service.js';


export class PositionController {
    constructor() {
        if (process.env.NODE_ENV === "production") {
            this.tagService = TagService.getInstance();
            this.plcService = PLCService.getInstance();
            this.positionService = new PositionService(this.tagService, this.plcService);
        } else {
            this.positionService = new PositionMockService();
        }
    }

    getAllPositions = async (req, res) => {
        try {
            const positions = await this.positionService.getPositions();
            return res.status(200).json(positions);
        } catch (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    getPositionById = async (req, res) => {
        const positionId = req.params.id;
        try {
            const position = await this.positionService.getPositionById(positionId);
            if (!position) {
                return res.status(404).json({ error: 'Position not found' });
            }
            return res.status(200).json(position);
        } catch (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    createPosition = async (req, res) => {
        try {
            const positionData = req.body;
            const newPosition = await this.positionService.createPosition(positionData);
            return res.status(201).json(newPosition);
        } catch (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    updatePositions = async (req, res) => {
        try {
            const { updates } = req.body;
            await this.positionService.updatePositions(updates);
            return res.status(200).json({ message: 'Positions updated successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    deletePositions = async (req, res) => {
        try {
            const { positionIds } = req.body;
            await this.positionService.deletePositions(positionIds);
            return res.status(200).json({ message: 'Positions successfully deleted' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    savePositionOrder = async (req, res) => {
        try {
            const { positions } = req.body;
            await this.positionService.savePositionOrder(positions);
            return res.status(200).json({ message: 'Position order successfully saved' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };
}

export const positionController = new PositionController();
