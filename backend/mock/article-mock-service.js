import mockArticles from './mock-article.js';

class ArticleMockService {
    static articles = mockArticles;

    static lastId = 1;

    static async getArticles() {
        return this.articles;
    }

    static async getArticleById(id) {
        const article = this.articles.find(a => a.id === parseInt(id, 10));
        if (!article) return null;
        return article;
    }

    static async createArticle(articleData) {
        const newArticle = {
            id: ++this.lastId,
            title: articleData.title,
            number: articleData.number,
            customer: articleData.customer,
            area: articleData.area || '',
            drainage: articleData.drainage || '',
            anodic: articleData.anodic || false,
            note: articleData.note || '',
            createdDate: new Date().toISOString(),
            createdBy: articleData.createdBy,
            modifiedDate: null,
            modifiedBy: null,
            sequence: articleData.sequence || []
        };

        this.articles.push(newArticle);
        return newArticle;
    }

    static async updateArticle(id, articleData) {
        const index = this.articles.findIndex(a => a.id === parseInt(id, 10));
        if (index === -1) return null;

        const updatedArticle = {
            ...this.articles[index],
            ...articleData,
            modifiedDate: new Date().toISOString(),
            id: parseInt(id, 10)
        };

        this.articles[index] = updatedArticle;
        return updatedArticle;
    }

    static async deleteArticle(id) {
        const index = this.articles.findIndex(a => a.id === parseInt(id, 10));
        if (index === -1) return false;
        
        this.articles.splice(index, 1);
        return true;
    }
}

export default ArticleMockService;