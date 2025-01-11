import mockPositions from '../../data/mock-positions.js';
import logger from '../../utils/logger.js';

class PositionMockService {
    constructor() {
        this.positions = [...mockPositions];
        this.plcService = null;
    }

    async getPositions() {
        try {
            const mappedPositions = await Promise.all(
                this.positions.map(position => PositionMockService.mapPositionData(position))
            );
            return mappedPositions;
        } catch (error) {
            logger.error('Error getting positions:', error);
            throw error;
        }
    }

    async getPositionById(positionId) {
        try {
            const id = Number(positionId);
            const position = this.positions.find(pos => pos.id === id);
            if (!position) return null;
            return PositionMockService.mapPositionData(position);
        } catch (error) {
            logger.error('Error getting position by id:', error);
            throw error;
        }
    }

    async createPosition(positionData) {
        try {
            const newId = Math.max(...this.positions.map(p => p.id)) + 1;
            const newPosition = {
                ...positionData,
                id: newId
            };
            this.positions.push(newPosition);
            return PositionMockService.mapPositionData(newPosition);
        } catch (error) {
            logger.error('Error creating position:', error);
            throw error;
        }
    }

    async updatePositions(updates) {
        try {
            updates.forEach(update => {
                const position = this.positions.find(p => p.id === update.id);
                if (position) {
                    position.number = update.updates.number;
                    position.name = update.updates.name;
                    position.temperature.isPresent = update.updates.temperature.isPresent;
                    position.current.isPresent = update.updates.current.isPresent;
                    position.voltage.isPresent = update.updates.voltage.isPresent;
                }
            });
            return true;
        } catch (error) {
            logger.error('Error updating positions:', error);
            throw error;
        }
    }

    async deletePositions(positionIds) {
        try {
            const positionNumbers = this.positions
                .filter(p => positionIds.includes(p.id))
                .map(p => p.number);

            this.positions = this.positions.filter(p => !positionIds.includes(p.id));

            if (this.plcService) {
                await Promise.all(positionNumbers.map(number => 
                    this.plcService.unsubscribeFromPosition(number)
                ));
            }

            return true;
        } catch (error) {
            logger.error('Error deleting positions:', error);
            throw error;
        }
    }

    static async mapPositionData(position) {
        // Mock-Implementation der Mapping-Funktion
        return {
            ...position,
            time: {
                actual: position.time.actual,
                preset: position.time.preset
            }
        };
    }
}

export default PositionMockService; 