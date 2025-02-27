import ArticleService from '../services/article-service.js';
import ArticleMockService from '../mock/article-mock-service.js';
import logger from '../utils/logger.js';

class ArticleController {

    constructor() {
        if (process.env.NODE_ENV === "production") {
            this.articleService = ArticleService;
        } else {
            this.articleService = ArticleMockService;
        }
    }

    getAllArticles = async (req, res) => {
        try {
            const articles = await this.articleService.getArticles();
            return res.status(200).json(articles);
        } catch (err) {
            logger.error('Error getting articles:', err);
            return res.status(500).json({ error: err.message || 'Internal Server Error' });
        }
    };

    getArticleById = async (req, res) => {
        try {
            const article = await this.articleService.getArticleById(req.params.id);
            if (!article) {
                return res.status(404).json({ error: 'Article not found' });
            }
            return res.json(article);
        } catch (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    createArticle = async (req, res) => {
        try {
            const articleData = req.body;
            logger.info('Received article data:', articleData);
            
            // Validate required fields
            if (!articleData.title || !articleData.number || !articleData.customer) {
                return res.status(400).json({ 
                    error: 'Missing required fields: title, number, and customer are required' 
                });
            }

            // Validate sequence data if present
            if (articleData.sequence) {
                logger.info('Validating sequence data:', articleData.sequence);
                if (!Array.isArray(articleData.sequence)) {
                    return res.status(400).json({ 
                        error: 'Sequence must be an array' 
                    });
                }
                
                // Use array.some() instead of for...of
                const hasInvalidSequence = articleData.sequence.some(seq => 
                    !seq.positionId || !seq.orderNumber
                );

                if (hasInvalidSequence) {
                    return res.status(400).json({ 
                        error: 'Each sequence must have positionId and orderNumber',
                        invalidSequence: articleData.sequence.find(seq => 
                            !seq.positionId || !seq.orderNumber
                        )
                    });
                }
            }

            const newArticle = await this.articleService.createArticle(articleData);
            return res.status(201).json(newArticle);
        } catch (err) {
            logger.error('Error in createArticle:', err);
            return res.status(500).json({ 
                error: err.message || 'Internal Server Error',
                details: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        }
    };

    updateArticle = async (req, res) => {
        try {
            const articleId = req.params.id;
            const articleData = req.body;
            await this.articleService.updateArticle(articleId, articleData);
            return res.status(200).json({ message: 'Article updated successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    deleteArticle = async (req, res) => {
        try {
            const articleId = req.params.id;
            await this.articleService.deleteArticle(articleId);
            return res.status(200).json({ message: 'Article successfully deleted' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };
}

export default ArticleController;