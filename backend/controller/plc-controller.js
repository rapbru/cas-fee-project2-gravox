import { plcData } from '../services/plc-data.js'
import { TagData } from '../services/tag-data.js';

export class PlcController {

    getPlcValues = async (req, res) => {
        res.json((await plcData.all() || []))
    };

    getTagValue = async (req, res) => {
        res.json(await plcData.get(req.params.tagName));
    };

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