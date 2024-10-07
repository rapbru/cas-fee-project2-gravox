import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';


export class TagData {
    constructor() {
        const dirname = path.dirname(fileURLToPath(import.meta.url));
        console.log(dirname);
        this.filePath = path.resolve(dirname, '../predefined-tags/tags.json');
        this.initTagsIfNeeded();
    }

    async initTagsIfNeeded() {
        try {
            const fileContent = await fs.readFile(this.filePath, 'utf8');
            if (fileContent.trim() === '') {
                console.log('tags.json ist leer, Initialisierung erforderlich');
                await this.initTags();
            } else {
                console.log('tags.json existiert bereits und hat Inhalt, keine Initialisierung erforderlich');
            }
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log('tags.json existiert nicht, Initialisierung erforderlich');
                await this.initTags();
            } else {
                console.error('Fehler beim Überprüfen der Datei', err);
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
        }

        // for (let j = 0; j <= fbArr; j++) {
        //     for (let i = 0; i <= fbNbr; i++) {
        //         data.push({ tagName: `WT[${i},${j}]` });
        //     }
        // }

        try {
            await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
            console.log('Datei erfolgreich geschrieben');
        } catch (err) {
            console.error('Fehler beim Schreiben der Datei', err);
        }
    }

    async getTags() {
        try {
            const fileContent = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(fileContent);
        } catch (err) {
            console.error('Fehler beim Lesen der Datei', err);
            return [];
        }
    }
}

export const tagData = new TagData();
