import logger from '../utils/logger.js';

export default class ArticleLoadingService {
    constructor(plcService) {
        this.plcService = plcService;
    }

    async loadArticle(article) {
        const fbNumber = await this.getOrCreateFBNumber();
        await this.resetAndPrepareFB(fbNumber);
        const tags = ArticleLoadingService.prepareTagsForArticle(article, fbNumber);
        logger.info(`Tags: ${JSON.stringify(tags)}`);
        await this.writeTagsToPlc(tags);
        
        return {
            message: 'Article successfully loaded into the controller',
            flightbarNumber: fbNumber,
            loadedArticle: article,
            writtenTags: tags
        };
    }

    async getOrCreateFBNumber() {
        const flightbarNumber = await this.plcService.get('POS[50].FB.NBR');
        
        if (!ArticleLoadingService.isValidFlightbarNumber(flightbarNumber)) {
            const freeFbNumber = await this.plcService.findFreeFBNumber();
            await this.plcService.writeFBNumber(50, freeFbNumber);
            return freeFbNumber;
        }
        
        const fbNumber = ArticleLoadingService.parseFlightbarNumber(flightbarNumber);
        if (!ArticleLoadingService.isValidFlightbarNumber(fbNumber)) {
            throw new Error(`Invalid flightbar number: ${flightbarNumber.value}`);
        }

        return fbNumber;
    }

    async resetAndPrepareFB(fbNumber) {
        await this.plcService.resetFBArray(fbNumber);
        await ArticleLoadingService.delay(1000);
    }

    static prepareTagsForArticle(article, fbNumber) {
        const tags = [];
        
        tags.push(
            { tagName: `WT[${fbNumber},201]`, value: parseFloat(article.area.replace('dm²', '')) },
            { tagName: `WT[${fbNumber},203]`, value: parseFloat(article.drainage.replace('%', '')) }
        );

        // Sequenz-Informationen
        article.sequence.forEach((step, index) => ArticleLoadingService.addSequenceTags(tags, step, index, fbNumber));
        
        // Abschluss-Position
        ArticleLoadingService.addUnloadStation(tags, article, fbNumber);
        
        return tags;
    }

    static addSequenceTags(tags, step, index, fbNumber) {
        // Position (1-99)
        tags.push({
            tagName: `WT[${fbNumber},${index + 1}]`,
            value: step.positionId
        });

        // Sollzeit (101-199)
        tags.push({
            tagName: `WT[${fbNumber},${index + 101}]`,
            value: step.timePreset * 60
        });

        // Strom- und Spannungswerte
        if (step.currentPreset && step.presetCurrentAddress) {
            tags.push({
                tagName: `WT[${fbNumber},${step.presetCurrentAddress}]`,
                value: step.currentPreset
            });
        }
        if (step.voltagePreset && step.presetVoltageAddress) {
            tags.push({
                tagName: `WT[${fbNumber},${step.presetVoltageAddress}]`,
                value: step.voltagePreset * 10
            });
        }
    }

    async writeTagsToPlc(tags) {
        await this.plcService.writeTagGroupDirect(tags);
        await this.plcService.writeMultipleBits('POS[50].FB.EL1', [
            { bitNumber: 12, value: true },
            { bitNumber: 13, value: true }
        ]);
        await this.plcService.writeTagGroupDirect([
            { tagName: 'POS[50].FB.SEQ', value: 1 }
        ]);
    }

    static addUnloadStation(tags, article, fbNumber) {
        const lastIndex = article.sequence.length + 1;
        tags.push({
            tagName: `WT[${fbNumber},${lastIndex}]`,
            value: 50  // Position 50 = Be-/Entladestation
        });

        tags.push({
            tagName: `POS[50].FB.EL1`,
            value: 0
        });
    }

    static parseFlightbarNumber(flightbarNumber) {
        return parseInt(flightbarNumber.value, 10);
    }

    static isValidFlightbarNumber(fbNumber) {
        return !Number.isNaN(fbNumber) && 
               fbNumber > 0 && 
               fbNumber <= 30;
    }

    static delay(ms) {
        return new Promise(resolve => {setTimeout(resolve, ms)});
    }
} 