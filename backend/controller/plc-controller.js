import PLCService from '../plc/plc-service.js';
import PLCMockData from '../data/plc-mock-data.js';
import PLCConnection from '../plc/plc-connection.js'

export class PLCController {
    constructor() {
        this.plcConnection = new PLCConnection('10.198.200.82');
        this.plcService = (process.env.NODE_ENV === "production" ? PLCService.getInstance(this.plcConnection) : new PLCMockData());
    }

    getAllValues = async (req, res) => {
        try {
            const values = await this.plcService.all();
            res.json(values || []);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    getTagValue = async (req, res) => {
        try {
            const tags = req.body;
            const tagNames = tags.map(tag => tag.tagName);
            const values = await Promise.all(tagNames.map(tagName => this.plcService.get(tagName)));
            res.json(values || []);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    writeTagValue = async (req, res) => {
        try {
            const tags = req.body;

            if (!Array.isArray(tags) || tags.length === 0) {
                return res.status(400).json({ error: "An array of tags with their names and values is required" });
            }

            const result = await this.plcService.write(tags);
            return res.json(result);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    getStructureByNumber = async (req, res) => {
        try {
            const { tagname, nbr } = req.params;
            const structureTag = `${tagname}[${nbr}]`;
            const structure = await this.plcService.readOnce(structureTag);
            
            if (!structure) {
                return res.status(404).json({ 
                    error: `Struktur ${structureTag} nicht gefunden` 
                });
            }
            
            // structure.value.FB.NBR = 0;

            // await this.plcService.writeStructure(structure);

            return res.json({
                tagName: structureTag,
                arrayIndex: parseInt(nbr, 10),
                value: structure.value,
                type: structure.type
            });

        } catch (err) {
            console.error('Fehler beim Abrufen der Struktur:', err);
            return res.status(500).json({ error: err.message });
        }
    }
}

export const plcController = new PLCController();