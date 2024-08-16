import PLCConnection from "./plc-connection.js";

export default class PlcData {
    constructor() {
        this.plcConnection = new PLCConnection();    
    }

    async all() {
        return this.plcConnection.getAllData();
    }

    async get(aTag) {
        return this.plcConnection.getTagData(aTag);
    }
};