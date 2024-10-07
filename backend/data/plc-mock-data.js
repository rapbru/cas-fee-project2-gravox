export default class PLCMockData {

    constructor() {
        this.tagValues =  [
            { "tag": "POS[0].FB.NBR", "value": 0 },
            { "tag": "POS[0].TIME.PRESET", "value": 0 },
            { "tag": "POS[0].TEMP.PRESET", "value": 0 },
            { "tag": "POS[0].TIME.ACTUAL", "value": 0 },
            { "tag": "POS[0].TEMP.ACTUAL1", "value": 0 },
            { "tag": "POS[1].FB.NBR", "value": 0 },
            { "tag": "POS[1].TIME.PRESET", "value": 100 },
            { "tag": "POS[1].TEMP.ACTUAL1", "value": 50 },
            { "tag": "POS[1].TEMP.PRESET", "value": 60 },
            { "tag": "POS[1].TIME.ACTUAL", "value": 10 },
            { "tag": "POS[2].FB.NBR", "value": 0 },
            { "tag": "POS[2].TIME.PRESET", "value": 300 },
            { "tag": "POS[2].TEMP.ACTUAL1", "value": 20 },
            { "tag": "POS[2].TEMP.PRESET", "value": 22 },
            { "tag": "POS[2].TIME.ACTUAL", "value": 0 },
            { "tag": "POS[3].FB.NBR", "value": 0 },
            { "tag": "POS[3].TIME.PRESET", "value": 300 },
            { "tag": "POS[3].TEMP.ACTUAL1", "value": 35 },
            { "tag": "POS[3].TEMP.PRESET", "value": 33 },
            { "tag": "POS[3].TIME.ACTUAL", "value": 0 }            
        ];
        this.defaultTagValue = 0;
    }

    async all() {
        return this.tagValues;
    }

    async get(tagName) {
        // Mock response for the tag value
        return { "tag": tagName, "value": this.defaultTagValue };
    }
}