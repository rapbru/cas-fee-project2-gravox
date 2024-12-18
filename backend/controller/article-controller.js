import ArticleService from '../services/article-service.js';

class ArticleController {
    static getAllArticles = async (req, res) => {
        try {
            const articles = await ArticleService.getArticles();
            return res.json(articles);
        } catch (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    static getArticleById = async (req, res) => {
        try {
            const article = await ArticleService.getArticleById(req.params.id);
            if (!article) {
                return res.status(404).json({ error: 'Article not found' });
            }
            return res.json(article);
        } catch (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    static createArticle = async (req, res) => {
        try {
            const articleData = req.body;
            const newArticle = await ArticleService.createArticle(articleData);
            return res.status(201).json(newArticle);
        } catch (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    static updateArticle = async (req, res) => {
        try {
            const articleId = req.params.id;
            const articleData = req.body;
            await ArticleService.updateArticle(articleId, articleData);
            return res.status(200).json({ message: 'Article updated successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    static deleteArticle = async (req, res) => {
        try {
            const articleId = req.params.id;
            await ArticleService.deleteArticle(articleId);
            return res.status(200).json({ message: 'Article successfully deleted' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };
}

export default ArticleController;