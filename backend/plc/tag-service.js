import { TagGroup } from 'st-ethernet-ip';

export default class TagService {
    static instance = null;

    constructor(plcConnection) {
        if (TagService.instance) {
            throw new Error("Use TagService.getInstance() to get the instance.");
        }
        this.plcConnection = plcConnection;
        this.setupEventHandlers();
        this.tags = [];
        this.tagInitPromises = {};

        TagService.instance = this;
    }

    static getInstance(plcConnection) {
        if (!TagService.instance) {
            TagService.instance = new TagService(plcConnection);
        }
        return TagService.instance;
    }

    setupEventHandlers() {
        this.plcConnection.controller.on("TagInit", (tag) => {
            console.log(`${tag.name} initial value: ${tag.value}, datatype: ${tag.type}`);
            this.updateTagInArray(tag);

            if (this.tagInitPromises[tag.name]) {
                this.tagInitPromises[tag.name].resolve(tag); 
                delete this.tagInitPromises[tag.name];
            }
        });
        
        this.plcConnection.controller.on("TagChanged", (tag, lastValue) => {
            console.log(`${tag.name} changed from ${lastValue} -> ${tag.value}`);
            this.updateTagInArray(tag);
        });
    }

    async loadTagsFromTagData(tagData) {
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

            // this.plcConnection.controller.scan();
            console.log('All tags have been successfully subscribed.');
        } catch (error) {
            console.error('Error while loading and subscribing to tags:', error);
        }
    }

    async subscribeTags(tagNames) {
        const promises = tagNames.map(async currentTag => new Promise((resolve, reject) => {
            console.log(`Subscribe Tag: ${currentTag}`);
            this.plcConnection.controller.addTag(currentTag);
            this.tagInitPromises[currentTag] = { resolve, reject };
            
            setTimeout(() => {
                reject(new Error(`Tag ${currentTag.name} initialization timed out.`));
                delete this.tagInitPromises[currentTag];
            }, 5000); 
        }));
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

    async getTagData(tagName) {
        if (!this.isTagSubscribed(tagName)) {
            await this.subscribeTags([tagName]);
        }
        const tag = this.tags.find(t => t.name === tagName);
        return { "tag": tagName, "value": tag ? tag.value : null };
    }

    isTagSubscribed(tagName) {
        return this.tags.some(tag => tag.name === tagName);
    }

    async writeTagData(tagDataArray) {
        try {
            const tagGroup = new TagGroup();
            await Promise.all(tagDataArray.map(async (data) => {
                if (!this.isTagSubscribed(data.tagName)) {
                    await this.subscribeTags([data.tagName]);
                }
                const tag = this.tags.find(t => t.name === data.tagName);
                if (tag) {
                    tag.value = data.value;
                    tagGroup.add(tag);
                }
            }));

            if (tagGroup.size > 0) {
                await this.plcConnection.controller.writeTagGroup(tagGroup);
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

    async getTagsForPosition(positionNumber) {
        const tagsForPosition = this.tags.filter(tag => tag.name.includes(`POS[${positionNumber}]`));
        return tagsForPosition.map(tag => ({ "tag": tag.name, "value": tag.value }));
    }
}
