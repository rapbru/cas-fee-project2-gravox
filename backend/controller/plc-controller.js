import PLCService from '../plc/plc-service.js';
import PLCMockData from '../data/plc-mock-data.js';
import PLCConnection from '../plc/plc-connection.js'
import ArticleService from '../services/article-service.js';
import ArticleLoadingService from '../services/article-loading-service.js';
import ArticleLoadingMock from '../data/article-loading-mock.js';

export class PLCController {
    constructor() {
        this.plcConnection = new PLCConnection('10.198.200.39');
        
        if (process.env.NODE_ENV === "production") {
            this.plcService = PLCService.getInstance(this.plcConnection);
            this.articleLoadingService = new ArticleLoadingService(this.plcService);
        } else {
            this.plcService = new PLCMockData();
            this.articleLoadingService = new ArticleLoadingMock();
        }
    }

    getAllValues = async (req, res) => {
        try {
            const values = await this.plcService.all();
            return res.status(200).json(values || []);
        } catch (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    getTagValue = async (req, res) => {
        try {
            const tags = req.body;
            const tagNames = tags.map(tag => tag.tagName);
            const values = await Promise.all(tagNames.map(tagName => this.plcService.get(tagName)));
            return res.status(200).json(values || []);
        } catch (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    writeTagValue = async (req, res) => {
        try {
            const tags = req.body;

            if (!Array.isArray(tags) || tags.length === 0) {
                return res.status(400).json({ error: "An array of tags with their names and values is required" });
            }

            const result = await this.plcService.write(tags);
            return res.status(200).json(result);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    getStructureByNumber = async (req, res) => {
        try {
            const { tagname, nbr } = req.params;
            const structureTag = `${tagname}[${nbr}]`;
            const structure = await this.plcService.readOnce(structureTag);
            
            if (!structure) {
                return res.status(404).json({ 
                    error: `Structure ${structureTag} not found` 
                });
            }

            return res.status(200).json({
                tagName: structureTag,
                arrayIndex: parseInt(nbr, 10),
                value: structure.value,
                type: structure.type
            });

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    loadArticleToPlc = async (req, res) => {
        try {
            const articleId = parseInt(req.params.id, 10);
            if (!articleId || Number.isNaN(articleId)) {
                return res.status(400).json({ error: 'Valid article ID is required' });
            }

            const article = await ArticleService.getArticleById(articleId);
            if (!article) {
                return res.status(404).json({ error: 'Article not found' });
            }

            const result = await this.articleLoadingService.loadArticle(article);
            return res.status(200).json(result);

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export const plcController = new PLCController();