//Connection Manager automagically reconnects to controller that have lost connection. Scanner auto initiated.

import { Controller, Tag } from 'st-ethernet-ip';
import { tagData } from './tag-data.js';

export class PlcConnection {
    constructor() {
        this.PLC = new Controller();

        this.PLC.connect("10.198.200.82", 0).then(() => {
            console.log(`\n\nConnected to PLC ${this.PLC.properties.name}...\n`);
            this.loadTagsFromTagData();
            this.PLC.scan_rate = 1000;
        }).catch(err => {
            console.error("Error connecting to PLC:", err);
        });

        this.tags = {};  // Speicher für Tag-Werte
    }

    chunkArray(array, size) {
        const chunkedArray = [];
        for (let i = 0; i < array.length; i += size) {
            chunkedArray.push(array.slice(i, i + size));
        }
        return chunkedArray;
    }

    async loadTagsFromTagData() {
        try {
            const tags = await tagData.getTags();
            const tagChunks = this.chunkArray(tags, 50); // Hier 50 als maximale Anzahl der Tags pro Chunk

            for (const chunk of tagChunks) {
                console.log(chunk);
                const tagNames = chunk.map(tag => tag.tagName);
                await this.subscribeTags(tagNames);
            }
            this.PLC.scan();
            console.log('Alle Tags wurden erfolgreich abonniert.');
        } catch (error) {
            console.error('Fehler beim Laden und Abonnieren der Tags:', error);
        }
    }

    async subscribeTags(tagNames) {
        const tags = tagNames.map(tagName => new Tag(tagName));
        const promises = tags.map(async tag => {
            console.log(`Subscribe Tag: ${tag.name}`);
            this.PLC.subscribe(tag);
            tag.on("Changed", (tag, lastValue) => {
                console.log(`${tag.name} changed from ${lastValue} -> ${tag.value}`);
                this.tags[tag.name] = tag.value;
            });
            await this.PLC.readTag(tag).then(() => {
                console.log(`${tag.name} initial value: ${tag.value}`);
                this.tags[tag.name] = tag.value;
            }).catch(err => {
                console.error(`Error reading tag ${tag.name}:`, err);
            });
        });
        await Promise.all(promises);
    }    

    async getAllData() {
        return Object.keys(this.tags).map(tagName => {
            return { "tag": tagName, "value": this.tags[tagName] };
        });
    }

    isTagSubscribed(tagName) {
        return !this.tags.hasOwnProperty(tagName);
    }

    async getTagData(aTag) {
        console.log(`getTagData Tag: ${aTag}`);
        if (this.isTagSubscribed(aTag)) {
            await this.subscribeTags([aTag]);
        }        
        return { "tag": aTag, "value": this.tags[aTag] };
    }

}

export const plcConnection = new PlcConnection();