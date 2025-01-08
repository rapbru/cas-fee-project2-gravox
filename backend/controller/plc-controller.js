import PLCService from '../plc/plc-service.js';
import PLCMockData from '../data/plc-mock-data.js';
import PLCConnection from '../plc/plc-connection.js'
import ArticleService from '../services/article-service.js';
import logger from '../utils/logger.js';

export class PLCController {
    constructor() {
        this.plcConnection = new PLCConnection('10.198.200.39');
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

            return res.json({
                tagName: structureTag,
                arrayIndex: parseInt(nbr, 10),
                value: structure.value,
                type: structure.type
            });

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    loadArticleToPlc = async (req, res) => {
        try {
            const articleId = parseInt(req.params.id, 10);
            
            if (!articleId || Number.isNaN(articleId)) {
                return res.status(400).json({ error: 'Gültige Artikel ID ist erforderlich' });
            }

            const article = await ArticleService.getArticleById(articleId);
            if (!article) {
                return res.status(404).json({ error: 'Artikel nicht gefunden' });
            }
            
            try {
                // Warenträgernummer aus der Steuerung lesen
                const carrierNumber = await this.plcService.get('POS[50].FB.NBR');
                logger.info('Gelesene Warenträgernummer:', carrierNumber);

                let wtNumber;

                // Wenn keine Warenträgernummer vorhanden ist, suche eine freie
                if (!carrierNumber || typeof carrierNumber.value === 'undefined' || 
                    carrierNumber.value === null || carrierNumber.value <= 0) {
                    logger.info('Keine Warenträgernummer vorhanden, suche freie Nummer...');
                    wtNumber = await this.plcService.tagService.findFreeWTNumber();
                    await this.plcService.tagService.writeWTNumber(50, wtNumber);
                    logger.info(`Neue Warenträgernummer ${wtNumber} wurde gesetzt`);
                } else {
                    // Stelle sicher, dass wir eine gültige Nummer haben
                    wtNumber = typeof carrierNumber.value === 'number' ? 
                        carrierNumber.value : 
                        parseInt(String(carrierNumber.value), 10);

                    if (Number.isNaN(wtNumber) || wtNumber <= 0 || wtNumber > 30) {
                        return res.status(400).json({ 
                            error: `Ungültige Warenträgernummer: ${carrierNumber.value}`,
                            details: {
                                originalValue: carrierNumber.value,
                                type: typeof carrierNumber.value
                            }
                        });
                    }
                }

                logger.info(`Artikel ${article.id} wird in Warenträger ${wtNumber} geladen`);

                // Zuerst das WT-Array zurücksetzen
                logger.info(`Beginne mit dem Zurücksetzen von WT[${wtNumber}]`);
                await this.plcService.tagService.resetWTArray(wtNumber);
                logger.info(`WT[${wtNumber}] wurde zurückgesetzt`);
                
                // Warte 2 Sekunden nach dem Zurücksetzen
                await new Promise((resolve) => { setTimeout(resolve, 1000); });
                logger.info('Starte mit dem Schreiben der neuen Werte');

                // Bereite alle Tags vor
                const tagsToWrite = [];

                // Fläche in WT[x,201]
                tagsToWrite.push({
                    tagName: `WT[${wtNumber},201]`,
                    value: parseFloat(article.area.replace('dm²', ''))
                });

                // Abtropfen in WT[x,203]
                tagsToWrite.push({
                    tagName: `WT[${wtNumber},203]`,
                    value: parseFloat(article.drainage.replace('%', ''))
                });

                // Ablauf und Zeiten
                article.sequence.forEach((step, index) => {
                    // Position (1-99)
                    tagsToWrite.push({
                        tagName: `WT[${wtNumber},${index + 1}]`,
                        value: step.positionId
                    });

                    // Sollzeit (101-199)
                    tagsToWrite.push({
                        tagName: `WT[${wtNumber},${index + 101}]`,
                        value: step.timePreset
                    });

                    // Strom- und Spannungswerte mit den korrekten Adressen
                    if (step.currentPreset && step.presetCurrentAddress) {
                        tagsToWrite.push({
                            tagName: `WT[${wtNumber},${step.presetCurrentAddress}]`,
                            value: step.currentPreset
                        });
                    }
                    if (step.voltagePreset && step.presetVoltageAddress) {
                        tagsToWrite.push({
                            tagName: `WT[${wtNumber},${step.presetVoltageAddress}]`,
                            value: step.voltagePreset
                        });
                    }
                });

                // Füge Position 50 (Be-/Entladestation) als letzte Position hinzu
                const lastIndex = article.sequence.length + 1;
                tagsToWrite.push({
                    tagName: `WT[${wtNumber},${lastIndex}]`,
                    value: 50  // Position 50 = Be-/Entladestation
                });

                // EL1 auf 0 setzen
                tagsToWrite.push({
                    tagName: `POS[50].FB.EL1`,
                    value: 0
                });

                // Schreibe alle Tags als Gruppe
                await this.plcService.tagService.writeTagGroupDirect(tagsToWrite);
                
                // Dann die spezifischen Bits setzen
                await this.plcService.tagService.writeMultipleBits('POS[50].FB.EL1', [
                    { bitNumber: 12, value: true }, // WT existiert Bit
                    { bitNumber: 13, value: true }  // Automat Bit
                ]);

                // SEQ auf 1 setzen
                await this.plcService.tagService.writeTagGroupDirect([
                    {
                        tagName: `POS[50].FB.SEQ`,
                        value: 1
                    }
                ]);
                
                return res.json({
                    message: 'Artikel erfolgreich in die Steuerung geladen',
                    warentraeger: wtNumber,
                    artikel: article,
                    writtenTags: tagsToWrite
                });

            } catch (err) {
                return res.status(500).json({ error: err.message });
            }

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export const plcController = new PLCController();