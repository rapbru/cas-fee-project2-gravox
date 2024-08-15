import PLCData from '../services/plc-data.js'
import PLCMockData from '../services/plc-mock-data.js';


// import { TagData } from '../services/tag-data.js';

export class PlcController {

    constructor(plcData) { 
        this.plcData = plcData || (process.env.NODE_ENV === "production" ? new PLCData() : new PLCMockData());
    }

    getPlcValues = async (req, res) => {
        res.json((await this.plcData.all()) || []);
    }

    getTagValue = async (req, res) => {
        res.json(await this.plcData.get(req.params.tagName));
    }

    // doSomething = async (req, res) => {
    //     res.json(await plcData.add(req.body));
    // };

    // doSomething = async (req, res) => {
    //     res.json(await plcData.update(req.params.id, req.body));
    // };

    // doSomething = async (req, res) => {
    //     res.json(await plcData.delete(req.params.id));
    // };
}

export const plcController = new PlcController();