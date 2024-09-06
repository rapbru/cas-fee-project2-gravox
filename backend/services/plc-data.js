import PLCConnection from "./plc-connection.js";

export default class PlcData {
    constructor() {
        this.plcConnection = new PLCConnection();    
    }

    async all() {
        return this.plcConnection.getAllData();
    }

    async get(tagName) {
        return this.plcConnection.getTagData(tagName);
    }

    async write(tags) {
        return this.plcConnection.writeTagData(tags);
    }
};