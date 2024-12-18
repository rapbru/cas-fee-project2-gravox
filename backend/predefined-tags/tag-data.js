import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import logger from '../utils/logger.js';


export class TagData {
    constructor() {
        const dirname = path.dirname(fileURLToPath(import.meta.url));
        logger.info(dirname);
        this.filePath = path.resolve(dirname, '../predefined-tags/tags.json');
        this.initTagsIfNeeded();
    }

    async initTagsIfNeeded() {
        try {
            const fileContent = await fs.readFile(this.filePath, 'utf8');
            if (fileContent.trim() === '') {
                logger.info('tags.json ist leer, Initialisierung erforderlich');
                await this.initTags();
            } else {
                logger.info('tags.json existiert bereits und hat Inhalt, keine Initialisierung erforderlich');
            }
        } catch (err) {
            if (err.code === 'ENOENT') {
                logger.info('tags.json existiert nicht, Initialisierung erforderlich');
                await this.initTags();
            } else {
                logger.error('Fehler beim Überprüfen der Datei', err);
            }
        }
    }

    async initTags() {
        const pos = 50;
        // const fbNbr = 29;
        // const fbArr = 999;
        const data = [];

        for (let i = 0; i <= pos; i++) {
            data.push({ tagName: `POS[${i}].FB.NBR` });
            data.push({ tagName: `POS[${i}].TIME.PRESET` });
            data.push({ tagName: `POS[${i}].TIME.ACTUAL` });
            data.push({ tagName: `POS[${i}].TEMP.PRESET` });
            data.push({ tagName: `POS[${i}].TEMP.ACTUAL1` });
            data.push({ tagName: `POS[${i}].GL.PRESETAMPS[1]` });
            data.push({ tagName: `POS[${i}].GL.ACTUALAMPS[1]` });
            data.push({ tagName: `POS[${i}].GL.PRESETVOLT[1]` });
            data.push({ tagName: `POS[${i}].GL.ACTUALVOLT[1]` });
        }

        // for (let j = 0; j <= fbArr; j++) {
        //     for (let i = 0; i <= fbNbr; i++) {
        //         data.push({ tagName: `WT[${i},${j}]` });
        //     }
        // }

        try {
            await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
            logger.info('Datei erfolgreich geschrieben');
        } catch (err) {
            logger.error('Fehler beim Schreiben der Datei', err);
        }
    }

    async getTags() {
        try {
            const fileContent = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(fileContent);
        } catch (err) {
            logger.error('Fehler beim Lesen der Datei', err);
            return [];
        }
    }
}

export const tagData = new TagData();
