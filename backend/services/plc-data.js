import { plcConnection } from "./plc-connection.js";

export class PlcData {
    constructor() {
    }

    async all() {
        return plcConnection.getAllData();
    }

    async get(aTag) {
        return plcConnection.getTagData(aTag);
    }
}

export const plcData = new PlcData();