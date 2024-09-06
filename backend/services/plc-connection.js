// Connection Manager automagically reconnects to controller that have lost connection. Scanner auto initiated.

import { Controller, Tag, TagGroup } from 'st-ethernet-ip';
import { tagData } from './tag-data.js';

export default class PlcConnection {
    constructor() {
        this.PLC = new Controller();

        this.PLC.connect("10.198.200.82", 0).then(() => {
            console.log(`\n\nConnected to PLC ${this.PLC.properties.name}...\n`);
            this.loadTagsFromTagData();
            this.PLC.scan_rate = 1000;
        }).catch(err => {
            console.error("Error connecting to PLC:", err);
        });

        this.tags = [];  // Speicher für Tag-Werte
    }

    async loadTagsFromTagData() {
        function chunkArray(array, size) {
            const chunkedArray = [];
            for (let i = 0; i < array.length; i += size) {
                chunkedArray.push(array.slice(i, i + size));
            }
            return chunkedArray;
        }

        try {
            const tags = await tagData.getTags();
            const tagChunks = chunkArray(tags, 50); // 50 als maximale Anzahl der Tags pro Chunk

            await tagChunks.reduce(async (previousPromise, chunk) => {
                await previousPromise;

                const tagNames = chunk.map(tag => tag.tagName);
                return this.subscribeTags(tagNames);
            }, Promise.resolve());

            this.PLC.scan();
            console.log('Alle Tags wurden erfolgreich abonniert.');
        } catch (error) {
            console.error('Fehler beim Laden und Abonnieren der Tags:', error);
        }
    }

    async subscribeTags(tagNames) {
        const tags = tagNames.map(tagName => new Tag(tagName));
        const promises = tags.map(async currentTag => {
            console.log(`Subscribe Tag: ${currentTag.name}`);
            this.PLC.subscribe(currentTag);
            currentTag.on("Changed", (tag, lastValue) => {
                console.log(`${tag.name} changed from ${lastValue} -> ${tag.value}`);
                this.updateTagInArray(tag);
            });
            await this.PLC.readTag(currentTag).then(() => {
                console.log(`${currentTag.name} initial value: ${currentTag.value}, datatype: ${currentTag.type}`);
                this.updateTagInArray(currentTag);
            }).catch(err => {
                console.error(`Error reading tag ${currentTag.name}:`, err);
            });
        });
        await Promise.all(promises);
    } 

    updateTagInArray(tag) {
        const index = this.tags.findIndex(t => t.name === tag.name);
        if (index === -1) {
            this.tags.push(tag);
        } else {
            this.tags[index] = tag;
        }
    }

    async getAllData() {
        return this.tags.map(tag => ({ "tag": tag.name, "value": tag.value }));
    }

    isTagSubscribed(tagName) {
        return this.tags.some(tag => tag.name === tagName);
    }

    async getTagData(tagName) {
        console.log(tagName);
        if (!this.isTagSubscribed(tagName)) {
            await this.subscribeTags([tagName]);
        }
        const tag = this.tags.find(t => t.name === tagName);
        return { "tag": tagName, "value": tag ? tag.value : null };
    }

    // async writeTagData(tagName, value) {
    //     try {
    //         const tag = this.tags.find(t => t.name === tagName);
    //         if (!tag) {
    //             throw new Error(`Tag ${tagName} is not subscribed.`);
    //         }
    //         tag.value = value;

    //         await this.PLC.writeTag(tag);

    //         return { success: true, tagName, value };
    //     } catch (err) {
    //         console.error(`Error writing tag ${tagName}:`, err);
    //         throw err;
    //     }
    // }

    async writeTagData(tagDataArray) {
        try {
            const tagGroup = new TagGroup();
            const tagsToWrite = await Promise.all(tagDataArray.map(async data => {
                console.log(data.tagName);
                if (!this.isTagSubscribed(data.tagName)) {
                    await this.subscribeTags([data.tagName]);
                }
                const tag = this.tags.find(t => t.name === data.tagName);
                if (tag) {
                    tag.value = data.value;
                    tagGroup.add(tag);
                }
                return tag;
            }));

            if (tagsToWrite.length > 0) {
                await this.PLC.writeTagGroup(tagGroup);
                tagGroup.forEach(tag => {
                    console.log(`Tag ${tag.name} successfully written with value: ${tag.value}`);
                });
            }

            return { success: true, tagDataArray };
        } catch (err) {
            console.error('Error writing tags:', err);
            throw err;
        }
    }

};