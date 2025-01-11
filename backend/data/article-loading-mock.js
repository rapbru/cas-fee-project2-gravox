export default class ArticleLoadingMock {
    async loadArticle(article) {
        this.lastLoadedArticle = article;
        await new Promise(resolve => {setTimeout(resolve, 1000)}); // Fake write delay to PLC
        return {
            message: 'Article successfully loaded into the controller (Mock)',
            flightbarNumber: 1,
            loadedArticle: article,
            writtenTags: []
        };
    }
} 