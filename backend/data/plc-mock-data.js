export default class PLCMockData {

    constructor() {

        this.tagValues =  [];

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
        function getRandomFloat(min, max) {
            return parseFloat(Math.random() * (max - min) + min).toFixed(2);
        }

        const tempPreset = getRandomInt(0, 100);
        const ampPreset = getRandomFloat(0, 1000);
        const voltPreset = getRandomFloat(0, 20);  

        for (let i = 1; i <= 50; i++) {
            this.tagValues.push(
                { "tag": `POS[${i}].FB.NBR`, "value": i },
                { "tag": `POS[${i}].TIME.PRESET`, "value": getRandomInt(0, 120) },
                { "tag": `POS[${i}].TIME.ACTUAL`, "value": getRandomInt(0, 50) },
                { "tag": `POS[${i}].TEMP.PRESET`, "value": tempPreset },
                { "tag": `POS[${i}].TEMP.ACTUAL1`, "value": tempPreset },
                { "tag": `POS[${i}].GL.PRESETAMPS[1]`, "value": ampPreset },
                { "tag": `POS[${i}].GL.ACTUALAMPS[1]`, "value": ampPreset },
                { "tag": `POS[${i}].GL.PRESETVOLT[1]`, "value": voltPreset },
                { "tag": `POS[${i}].GL.ACTUALVOLT[1]`, "value": voltPreset }
            );
        }

        this.defaultTagValue = 0;
    }

    async all() {
        return this.tagValues;
    }

    async get(tagName) {
        return { "tag": tagName, "value": this.defaultTagValue };
    }
}