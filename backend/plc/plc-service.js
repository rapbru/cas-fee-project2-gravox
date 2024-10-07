import PLCConnection from "./plc-connection.js";
import TagService from "./tag-service.js";
import { tagData } from '../predefined-tags/tag-data.js';

export default class PLCService {
    constructor() {
        this.plcConnection = new PLCConnection('10.198.200.82');
        this.tagService = new TagService(this.plcConnection);
        
        this.initialize();
    }

    async initialize() {
        try {
            await this.plcConnection.connect();
            if (this.plcConnection.isConnected()) {
                await this.tagService.loadTagsFromTagData(tagData);
            }
        } catch (error) {
            console.error('Error initializing PLC Service:', error);
        }
    }

    async all() {
        try {
            if (this.plcConnection.isConnected()) {
                return await this.tagService.getAllData();
            }
            return {};
        } catch (error) {
            console.error('Error retrieving all tag data:', error);
            throw error;
        }
    }

    async get(tagName) {
        try {
            return await this.tagService.getTagData(tagName);
        } catch (error) {
            console.error(`Error retrieving tag data for ${tagName}:`, error);
            throw error;
        }
    }

    async write(tags) {
        try {
            return await this.tagService.writeTagData(tags);
        } catch (error) {
            console.error('Error writing tag data:', error);
            throw error;
        }
    }
}
