import mockPositions from './mock-positions.js';

class MockStore {
    constructor() {
        this.tagValues = [];
        this.positions = mockPositions;
        this.initializeTags();
    }

    initializeTags() {
        const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const getRandomFloat = (min, max) => parseFloat(Math.random() * (max - min) + min).toFixed(2);

        const tempPreset = getRandomInt(0, 100);
        const ampPreset = getRandomFloat(0, 1000);
        const voltPreset = getRandomFloat(0, 20);

        for (let i = 1; i <= 100; i++) {
            const position = this.positions.find(p => p.number === i);
            this.tagValues.push(
                { "tag": `POS[${i}].FB.NBR`, "value": i },
                { "tag": `POS[${i}].TIME.PRESET`, "value": position?.time.preset || getRandomInt(0, 120) },
                { "tag": `POS[${i}].TIME.ACTUAL`, "value": position?.time.actual || getRandomInt(0, 50) },
                { "tag": `POS[${i}].TEMP.PRESET`, "value": position?.temperature.preset || tempPreset },
                { "tag": `POS[${i}].TEMP.ACTUAL1`, "value": position?.temperature.actual || tempPreset },
                { "tag": `POS[${i}].GL.PRESETAMPS[1]`, "value": position?.current.preset || ampPreset },
                { "tag": `POS[${i}].GL.ACTUALAMPS[1]`, "value": position?.current.actual || ampPreset },
                { "tag": `POS[${i}].GL.PRESETVOLT[1]`, "value": position?.voltage.preset || voltPreset },
                { "tag": `POS[${i}].GL.ACTUALVOLT[1]`, "value": position?.voltage.actual || voltPreset }
            );
        }
    }
}

export default new MockStore();