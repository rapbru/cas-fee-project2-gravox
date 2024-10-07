import { Tag, TagGroup } from 'st-ethernet-ip';

export default class TagService {
    constructor(plcConnection) {
        this.plcConnection = plcConnection;
        this.tags = [];
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

            this.plcConnection.controller.scan();
            console.log('Alle Tags wurden erfolgreich abonniert.');
        } catch (error) {
            console.error('Fehler beim Laden und Abonnieren der Tags:', error);
        }
    }

    async subscribeTags(tagNames) {
        const tags = tagNames.map(tagName => new Tag(tagName));
        const promises = tags.map(async currentTag => {
            console.log(`Subscribe Tag: ${currentTag.name}`);
            this.plcConnection.controller.subscribe(currentTag);
            currentTag.on("Changed", (tag, lastValue) => {
                console.log(`${tag.name} changed from ${lastValue} -> ${tag.value}`);
                this.updateTagInArray(tag);
            });
            await this.plcConnection.controller.readTag(currentTag).then(() => {
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
}
