import mockStore from './mock-store.js';
import logger from '../utils/logger.js';

export default class PLCMockService {
    constructor() {
        this.store = mockStore;
    }

    async all() {
        logger.info('all: ', this.store.tagValues);
        return this.store.tagValues;
    }

    async get(tagName) {
        logger.info('get: ', tagName);
        const tag = this.store.tagValues.find(t => t.tag === tagName);
        return { "tag": tagName, "value": tag?.value || 0 };
    }

    async write(tags) {
        try {
            const tagsArray = Array.isArray(tags) ? tags : Object.values(tags);
            logger.info('write: ', tagsArray);
            tagsArray.forEach(tag => {

                const posMatch = tag.tagName.match(/POS\[(\d+)\]/);
                if (!posMatch) return;
                
                const posNumber = parseInt(posMatch[1], 10);
                const position = this.store.positions.find(p => p.number === posNumber);
                if (!position) return;

                let existingTag;
                if (tag.tagName.toLowerCase().includes('time.preset')) {
                    existingTag = this.store.tagValues.find(t => t.tag === `POS[${posNumber}].TIME.PRESET`);
                } else if (tag.tagName.toLowerCase().includes('temp.preset')) {
                    existingTag = this.store.tagValues.find(t => t.tag === `POS[${posNumber}].TEMP.PRESET`);
                } else if (tag.tagName.toLowerCase().includes('voltage.preset')) {
                    existingTag = this.store.tagValues.find(t => t.tag === `POS[${posNumber}].GL.PRESETVOLT[1]`);
                } else if (tag.tagName.toLowerCase().includes('current.preset')) {
                    existingTag = this.store.tagValues.find(t => t.tag === `POS[${posNumber}].GL.PRESETAMPS[1]`);
                }

                if (existingTag) {
                    existingTag.value = tag.value;
                    
                    if (tag.tagName.toLowerCase().includes('time.preset')) {
                        position.time.preset = tag.value;
                    } else if (tag.tagName.toLowerCase().includes('temp.preset')) {
                        position.temperature.preset = tag.value;
                    } else if (tag.tagName.toLowerCase().includes('voltage.preset')) {
                        position.voltage.preset = tag.value;
                    } else if (tag.tagName.toLowerCase().includes('current.preset')) {
                        position.current.preset = tag.value;
                    }
                }
            });

            return {
                success: true,
                tags: tagsArray.map(tag => ({
                    tagName: tag.tagName,
                    success: true
                }))
            };
        } catch (error) {
            throw new Error('Error writing mock tag data: ', error.message);
        }
    }
}