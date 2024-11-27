import PositionService from '../services/position-service.js';
import TagService from '../plc/tag-service.js';
import PLCService from '../plc/plc-service.js';
import PLCMockData from '../data/plc-mock-data.js';

export class PositionController {
    constructor() {
        if (process.env.NODE_ENV === "production") {
            this.tagService = TagService.getInstance();
            this.plcService = PLCService.getInstance();
            this.positionService = new PositionService(this.tagService, this.plcService);
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

    createPosition = async (req, res) => {
        console.log(req.body);
        try {
            const positionData = req.body;
            const newPosition = await this.positionService.createPosition(positionData);
            return res.status(201).json(newPosition);
        } catch (err) {
            console.error('Error creating position:', err);
            return res.status(500).json({ error: 'Interner Server Fehler' });
        }
    };

    updatePositions = async (req, res) => {
        console.log(req.body);
        try {
            const { updates } = req.body;
            console.log(updates);
            await this.positionService.updatePositions(updates);
            return res.status(200).json({ message: 'Positions updated successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    deletePosition = async (req, res) => {
        try {
            const positionId = req.params.id;
            await this.positionService.deletePosition(positionId);
            return res.status(200).json({ message: 'Position erfolgreich gelöscht' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    savePositionOrder = async (req, res) => {
        try {
            const { positions } = req.body;
            await this.positionService.savePositionOrder(positions);
            return res.status(200).json({ message: 'Positionsreihenfolge erfolgreich gespeichert' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };
}

export const positionController = new PositionController();
