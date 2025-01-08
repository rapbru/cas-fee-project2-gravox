import { TagList, Structure } from 'st-ethernet-ip';
import TagService from "./tag-service.js";
import PositionService from '../services/position-service.js';
import logger from '../utils/logger.js';


export default class PLCService {
    static instance = null;

    constructor(plcConnection) {
        if (PLCService.instance) {
            throw new Error("Use PLCService.getInstance() to get the instance.");
        }
        
        this.plcConnection = plcConnection;
        this.tagService = TagService.getInstance(this.plcConnection);
        this.subscribedPositions = new Set();
        
        this.initialize();

        PLCService.instance = this;
    }

    async initialize() {
        try {
            await this.plcConnection.connect();
            if (this.plcConnection.isConnected()) {
                const positionNumbers = await PositionService.getPositionNumbers();
                await Promise.all(positionNumbers.map(number => this.subscribeToPosition(number)));
            }
            logger.info('Successfully subscribed positions:', 
                Array.from(this.subscribedPositions).sort((a, b) => a - b)
            );
        } catch (error) {
            logger.error('Error initializing PLC Service:', error);
        }
    }

    async subscribeToPosition(positionNumber) {
        if (this.subscribedPositions.has(positionNumber)) return;

        const tags = TagService.getPositionTags(positionNumber);
        await this.tagService.subscribeTags(tags);
        this.subscribedPositions.add(positionNumber);
    }

    async unsubscribeFromPosition(positionNumber) {
        if (!this.subscribedPositions.has(positionNumber)) return;

        const tags = TagService.getPositionTags(positionNumber);
        await this.tagService.unsubscribeTags(tags);
        this.subscribedPositions.delete(positionNumber);
    }

    async all() {
        try {
            return await this.tagService.getAllData();
        } catch (error) {
            logger.error('Error retrieving all tag data:', error);
            throw error;
        }
    }

    async get(tagName) {
        try {
            return await this.tagService.getTagData(tagName);
        } catch (error) {
            logger.error(`Error retrieving tag data for ${tagName}:`, error);
            throw error;
        }
    }

    async write(tags) {
        try {
            return await this.tagService.writeTagData(tags);
        } catch (error) {
            logger.error('Error writing tag data:', error);
            throw error;
        }
    }

    async readOnce(tagName) {
        try {
            if (!this.plcConnection.isConnected()) {
                await this.plcConnection.connect();
            }

            // Erstelle eine neue TagList Instanz
            const tagList = new TagList();
            
            // Hole die komplette Tag-Liste vom Controller
            await this.plcConnection.controller.PLC.getControllerTagList(tagList);

            logger.info(`TagList: ${tagList}`);

            // Erstelle und lese die Struktur
            const structureTag = new Structure(tagName, tagList);
            await this.plcConnection.controller.PLC.readTag(structureTag);

            logger.info(`StructureTag: ${structureTag}`);

            // Ermöglicht direktes Ändern der Werte
            structureTag.value = new Proxy(structureTag.value, {
                set: (target, prop, value) => {
                    Object.defineProperty(target, prop, {
                        value,
                        writable: true,
                        enumerable: true
                    });
                    structureTag.stage_write = true;
                    return true;
                }
            });

            return structureTag;

        } catch (error) {
            logger.error(`Error reading tag ${tagName}:`, error);
            throw error;
        }
    }

    async writeStructure(structureTag) {
        try {
            if (!this.plcConnection.isConnected()) {
                await this.plcConnection.connect();
            }

            await this.plcConnection.controller.PLC.writeTag(structureTag);
            return true;

        } catch (error) {
            logger.error('Error writing structure:', error);
            throw error;
        }
    }

    static getInstance(plcConnection) {
        if (!PLCService.instance) {
            PLCService.instance = new PLCService(plcConnection);
        }
        return PLCService.instance;
    }
}