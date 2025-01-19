import mockStore from './mock-store.js';
import logger from '../utils/logger.js';

class PositionMockService {
    constructor() {
        this.store = mockStore;
        this.plcService = null;
    }

    async getPositions() {
        try {
            return this.store.positions;
        } catch (error) {
            logger.error('Error getting positions:', error);
            throw error;
        }
    }

    async getPositionById(positionId) {
        try {
            const id = Number(positionId);
            const position = this.store.positions.find(pos => pos.id === id);
            return position || null;
        } catch (error) {
            logger.error('Error getting position by id:', error);
            throw error;
        }
    }

    async createPosition(positionData) {
        try {
            const newId = Math.max(...this.store.positions.map(p => p.id)) + 1;
            const newPosition = {
                ...positionData,
                id: newId
            };
            this.store.positions.push(newPosition);
            this.store.initializeTags();
            return newPosition;
        } catch (error) {
            logger.error('Error creating position:', error);
            throw error;
        }
    }

    async updatePositions(updates) {
        try {
            updates.forEach(update => {
                const position = this.store.positions.find(p => p.id === update.id);
                if (position) {
                    position.number = update.updates.number;
                    position.name = update.updates.name;
                    position.temperature.isPresent = update.updates.temperature.isPresent;
                    position.current.isPresent = update.updates.current.isPresent;
                    position.voltage.isPresent = update.updates.voltage.isPresent;
                }
            });
            this.store.initializeTags();
            return true;
        } catch (error) {
            logger.error('Error updating positions:', error);
            throw error;
        }
    }

    async deletePositions(positionIds) {
        try {
            const positionNumbers = this.store.positions
                .filter(p => positionIds.includes(p.id))
                .map(p => p.number);

            this.store.positions = this.store.positions.filter(p => !positionIds.includes(p.id));
            this.store.initializeTags();

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
}

export default PositionMockService; 