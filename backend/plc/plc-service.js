import TagService from "./tag-service.js";
import { tagData } from '../predefined-tags/tag-data.js';

export default class PLCService {
    static instance = null;

    constructor(plcConnection) {
        if (PLCService.instance) {
            throw new Error("Use PLCService.getInstance() to get the instance.");
        }
        
        this.plcConnection = plcConnection;
        this.tagService = TagService.getInstance(this.plcConnection);
        
        this.initialize();

        PLCService.instance = this;
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
            return await this.tagService.getAllData();
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

    static getInstance(plcConnection) {
        if (!PLCService.instance) {
            PLCService.instance = new PLCService(plcConnection);
        }
        return PLCService.instance;
    }
}