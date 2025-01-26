import express from 'express';
import ArticleController from '../controller/article-controller.js';

const router = express.Router();
const articleController = new ArticleController();

router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);
router.post('/', articleController.createArticle);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

export default router;
