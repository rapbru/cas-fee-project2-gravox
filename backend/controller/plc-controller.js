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

    writeTagValue = async (req, res) => {
        try {
            const tags = req.body;

            if (!Array.isArray(tags) || tags.length === 0) {
                return res.status(400).json({ error: "An array of tags with their names and values is required" });
            }
            
            const result = await this.plcData.write(tags);

            return res.json(result);
        } catch (err) {
            console.error('Error writing tag values:', err);
            return res.status(500).json({ error: err.message });
        }
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