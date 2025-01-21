import { TagGroup, Tag, EthernetIP } from 'st-ethernet-ip';
import logger from '../utils/logger.js';

export default class TagService {
    static instance = null;

    constructor(plcConnection) {
        if (TagService.instance) {
            throw new Error("Use TagService.getInstance() to get the instance.");
        }
        this.plcConnection = plcConnection;
        this.setupEventHandlers();
        this.tags = [];
        this.tagInitPromises = {};

        TagService.instance = this;
    }

    static getInstance(plcConnection) {
        if (!TagService.instance) {
            TagService.instance = new TagService(plcConnection);
        }
        return TagService.instance;
    }

    static getPositionTags(positionNumber) {
        return [
            `POS[${positionNumber}].FB.NBR`,
            `POS[${positionNumber}].TIME.ACTUAL`,
            `POS[${positionNumber}].TIME.PRESET`,
            `POS[${positionNumber}].TEMP.ACTUAL1`,
            `POS[${positionNumber}].TEMP.PRESET`,
            `POS[${positionNumber}].GL.ACTUALAMPS[1]`,
            `POS[${positionNumber}].GL.PRESETAMPS[1]`,
            `POS[${positionNumber}].GL.ACTUALVOLT[1]`,
            `POS[${positionNumber}].GL.PRESETVOLT[1]`
        ];
    }

    static chunkArray(array, size = 50) {
        const chunkedArray = [];
        for (let i = 0; i < array.length; i += size) {
            chunkedArray.push(array.slice(i, i + size));
        }
        return chunkedArray;
    }

    async subscribeTags(tags) {
        const tagChunks = TagService.chunkArray(tags);
        
        await tagChunks.reduce(async (previousPromise, chunk) => {
            await previousPromise;
            
            const chunkPromises = chunk.map(async currentTag => new Promise((resolve, reject) => {
                logger.info(`Subscribe Tag: ${currentTag}`);
                this.plcConnection.controller.addTag(currentTag);
                this.tagInitPromises[currentTag] = { resolve, reject };
                
                setTimeout(() => {
                    reject(new Error(`Tag ${currentTag} initialization timed out.`));
                    delete this.tagInitPromises[currentTag];
                }, 5000);
            }));

            return Promise.all(chunkPromises);
        }, Promise.resolve());
    }

    async unsubscribeTags(tags) {
        const tagChunks = TagService.chunkArray(tags);
        
        await tagChunks.reduce(async (previousPromise, chunk) => {
            await previousPromise;
            
            const chunkPromises = chunk.map(tag => {
                this.plcConnection.controller.removeTag(tag);
                this.tags = this.tags.filter(t => t.name !== tag);
                return Promise.resolve();
            });
            
            return Promise.all(chunkPromises);
        }, Promise.resolve());
    }

    setupEventHandlers() {
        this.plcConnection.controller.on("TagInit", (tag) => {
            logger.info(`${tag.name} initial value: ${tag.value}, datatype: ${tag.type}`);
            this.updateTagInArray(tag);

            if (this.tagInitPromises[tag.name]) {
                this.tagInitPromises[tag.name].resolve(tag); 
                delete this.tagInitPromises[tag.name];
            }
        });
        
        this.plcConnection.controller.on("TagChanged", (tag, lastValue) => {
            logger.info(`${tag.name} changed from ${lastValue} -> ${tag.value}`);
            this.updateTagInArray(tag);
        });
    }

    updateTagInArray(tag) {
        const index = this.tags.findIndex(t => t.name === tag.name);
        if (index === -1) {
            this.tags.push(tag);
        } else {
            this.tags[index] = tag;
        }
    }

    async getAllData() {
        return this.tags.map(tag => ({ "tag": tag.name, "value": tag.value }));
    }

    async getTagData(tagName) {
        if (!this.isTagSubscribed(tagName)) {
            await this.subscribeTags([tagName]);
        }
        const tag = this.tags.find(t => t.name === tagName);
        return { "tag": tagName, "value": tag ? tag.value : null };
    }

    isTagSubscribed(tagName) {
        return this.tags.some(tag => tag.name === tagName);
    }

    async writeTagData(tagDataArray) {
        try {
            const tagGroup = new TagGroup();
            await Promise.all(tagDataArray.map(async (data) => {
                let mappedTagName = data.tagName;
                
                if (data.tagName.toLowerCase().includes('time.preset')) {
                    mappedTagName = data.tagName.replace(/time\.preset/i, 'TIME.PRESET');
                } else if (data.tagName.toLowerCase().includes('voltage.preset')) {
                    mappedTagName = data.tagName.replace(/voltage\.preset/i, 'GL.PRESETVOLT[1]');
                } else if (data.tagName.toLowerCase().includes('current.preset')) {
                    mappedTagName = data.tagName.replace(/current\.preset/i, 'GL.PRESETAMPS[1]');
                }
    
                if (!this.isTagSubscribed(mappedTagName)) {
                    await this.subscribeTags([mappedTagName]);
                }
                
                const tag = this.tags.find(t => t.name === mappedTagName);
                if (tag) {
                    tag.value = data.value;
                    tagGroup.add(tag);
                }
            }));

            if (tagGroup.size > 0) {
                await this.plcConnection.controller.writeTagGroup(tagGroup);
                tagGroup.forEach(tag => {
                    logger.info(`Tag ${tag.name} successfully written with value: ${tag.value}`);
                });
            }

            return { success: true, tagDataArray };
        } catch (err) {
            logger.error('Error writing tags:', err);
            throw err;
        }
    }

    async getTagsForPosition(positionNumber) {
        const tagsForPosition = this.tags.filter(tag => tag.name.includes(`POS[${positionNumber}]`));
        return tagsForPosition.map(tag => ({ "tag": tag.name, "value": tag.value }));
    }

    async writeTagGroupDirect(tags) {
        try {
            const group = new TagGroup();
            const { DINT } = EthernetIP.CIP.DataTypes.Types;
            
            tags.forEach(({ tagName, value }) => {
                const tag = new Tag(tagName, null, DINT);
                tag.value = value;
                group.add(tag);
            });

            await this.plcConnection.controller.PLC.writeTagGroup(group);
            return true;
        } catch (error) {
            logger.error('Error writing tag group directly:', error);
            throw error;
        }
    }

    async resetFBArray(fbNumber) {
        try {
            const group = new TagGroup();
            const { DINT } = EthernetIP.CIP.DataTypes.Types;
            
            for (let i = 0; i < 1000; i++) {
                const tag = new Tag(`WT[${fbNumber},${i}]`, null, DINT);
                tag.value = 0;
                group.add(tag);
            }

            await this.plcConnection.controller.PLC.writeTagGroup(group);
            logger.info(`Flightbar[${fbNumber}] array successfully reset`);
            return true;
        } catch (error) {
            logger.error(`Error resetting flightbar[${fbNumber}] array:`, error);
            throw error;
        }
    }

    async writeMultipleBits(tagName, bits) {
        try {
            const { DINT } = EthernetIP.CIP.DataTypes.Types;
            
            const tag = new Tag(tagName, null, DINT);
            await this.plcConnection.controller.PLC.readTag(tag);
            
            const binaryStr = (tag.value || 0).toString(2).padStart(32, '0');
            const binaryArr = binaryStr.split('');
            
            bits.forEach(({ bitNumber, value: bitValue }) => {
                binaryArr[31 - bitNumber] = bitValue ? '1' : '0';
            });
            
            const newValue = parseInt(binaryArr.join(''), 2);
            
            tag.value = newValue;
            await this.plcConnection.controller.PLC.writeTag(tag);
            
            logger.info(`Bits ${bits.map(b => b.bitNumber).join(', ')} of ${tagName} set, new value: ${newValue}`);
            return true;
        } catch (error) {
            logger.error(`Error writing bits of ${tagName}:`, error);
            throw error;
        }
    }

    async writeBit(tagName, bitNumber, value) {
        return this.writeMultipleBits(tagName, [{ bitNumber, value }]);
    }

    async getAllFBNumbers() {
        try {
            const group = new TagGroup();
            const { DINT } = EthernetIP.CIP.DataTypes.Types;
            
            for (let i = 0; i <= 104; i++) {
                const tag = new Tag(`POS[${i}].FB.NBR`, null, DINT);
                group.add(tag);
            }

            await this.plcConnection.controller.PLC.readTagGroup(group);
            
            const activeWTNumbers = new Set();
            group.forEach(tag => {
                if (tag.value > 0 && tag.value <= 30) {
                    activeWTNumbers.add(tag.value);
                }
            });

            return Array.from(activeWTNumbers);
        } catch (error) {
            logger.error('Error reading flightbar numbers:', error);
            throw error;
        }
    }

    async findFreeFBNumber() {
        try {
            const activeFBNumbers = await this.getAllFBNumbers();
            
            for (let i = 1; i <= 30; i++) {
                if (!activeFBNumbers.includes(i)) {
                    return i;
                }
            }
            
            throw new Error('No free flightbar number available (1-30 are all occupied)');
        } catch (error) {
            logger.error('Error finding free flightbar number:', error);
            throw error;
        }
    }

    async writeFBNumber(positionNumber, fbNumber) {
        try {
            const { DINT } = EthernetIP.CIP.DataTypes.Types;
            const tag = new Tag(`POS[${positionNumber}].FB.NBR`, null, DINT);
            tag.value = fbNumber;
            await this.plcConnection.controller.PLC.writeTag(tag);
            logger.info(`Flightbar number ${fbNumber} to position ${positionNumber} written`);
            return true;
        } catch (error) {
            logger.error(`Error writing flightbar number to position ${positionNumber}:`, error);
            throw error;
        }
    }
}
