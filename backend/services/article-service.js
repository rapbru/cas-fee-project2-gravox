import pool from '../data/db-connection.js';
import logger from '../utils/logger.js';

class ArticleService {
    static async getArticles() {
        try {
            const query = `
                SELECT 
                    a.*,
                    json_agg(
                        json_build_object(
                            'positionId', s.position_id,
                            'orderNumber', s.order_number,
                            'timePreset', s.time_preset,
                            'currentPreset', s.current_preset,
                            'voltagePreset', s.voltage_preset,
                            'positionName', p.position_name
                        ) ORDER BY s.order_number
                    ) FILTER (WHERE s.id IS NOT NULL) as sequence
                FROM article a
                LEFT JOIN sequence s ON a.id = s.article_id
                LEFT JOIN position p ON s.position_id = p.id
                GROUP BY a.id
                ORDER BY a.id`;
            const result = await pool.query(query);
            return ArticleService.transformArticleData(result.rows);
        } catch (error) {
            logger.error('Error fetching articles:', error);
            throw error;
        }
    }

    static async createArticle(articleData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const articleQuery = `
                INSERT INTO article (
                    number, title, customer, area, drainage, 
                    anodic, note, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING id
            `;
            
            const articleResult = await client.query(articleQuery, [
                articleData.number,
                articleData.title,
                articleData.customer,
                articleData.area,
                articleData.drainage,
                articleData.anodic,
                articleData.note,
                articleData.createdBy
            ]);

            const articleId = articleResult.rows[0].id;

            if (articleData.sequence && articleData.sequence.length > 0) {
                const sequenceQuery = `
                    INSERT INTO sequence (
                        article_id, position_id, order_number,
                        time_preset, current_preset, voltage_preset
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `;

                await Promise.all(
                    articleData.sequence.map(seq => 
                        client.query(sequenceQuery, [
                            articleId,
                            seq.positionId,
                            seq.orderNumber,
                            seq.timePreset,
                            seq.currentPreset,
                            seq.voltagePreset
                        ])
                    )
                );
            }

            const getArticleQuery = `
                SELECT 
                    a.*,
                    json_agg(
                        json_build_object(
                            'positionId', s.position_id,
                            'orderNumber', s.order_number,
                            'timePreset', s.time_preset,
                            'currentPreset', s.current_preset,
                            'voltagePreset', s.voltage_preset,
                            'positionName', p.position_name
                        ) ORDER BY s.order_number
                    ) FILTER (WHERE s.id IS NOT NULL) as sequence
                FROM article a
                LEFT JOIN sequence s ON a.id = s.article_id
                LEFT JOIN position p ON s.position_id = p.id
                WHERE a.id = $1
                GROUP BY a.id`;

            const completeArticle = await client.query(getArticleQuery, [articleId]);
            
            await client.query('COMMIT');
            
            return ArticleService.transformArticleData([completeArticle.rows[0]])[0];
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error creating article:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static transformArticleData(articles) {
        return articles.map(article => {
            console.log('Transforming article:', article); // Debug log
            const transformed = {
                id: article.id,
                title: article.title,
                number: article.number, 
                customer: article.customer,
                area: article.area,
                drainage: article.drainage,
                anodic: article.anodic,
                note: article.note,
                createdDate: article.created_date,
                createdBy: article.created_by,
                modifiedDate: article.modified_date,
                modifiedBy: article.modified_by,
                sequence: article.sequence || []
            };
            console.log('Transformed article:', transformed); // Debug log
            return transformed;
        });
    }

    static async getArticleById(id) {
        try {
            const query = `
                SELECT 
                    a.*,
                    json_agg(
                        json_build_object(
                            'positionId', s.position_id,
                            'orderNumber', s.order_number,
                            'timePreset', s.time_preset,
                            'currentPreset', s.current_preset,
                            'voltagePreset', s.voltage_preset,
                            'positionName', p.position_name
                        ) ORDER BY s.order_number
                    ) FILTER (WHERE s.id IS NOT NULL) as sequence
                FROM article a
                LEFT JOIN sequence s ON a.id = s.article_id
                LEFT JOIN position p ON s.position_id = p.id
                WHERE a.id = $1
                GROUP BY a.id`;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            return ArticleService.transformArticleData([result.rows[0]])[0];
        } catch (error) {
            logger.error('Error fetching article by id:', error);
            throw error;
        }
    }

    static async updateArticleData(client, id, articleData) {
        const updateQuery = `
            UPDATE article 
            SET number = $1, title = $2, customer = $3, 
                area = $4, drainage = $5, anodic = $6, 
                note = $7, modified_by = $8
            WHERE id = $9`;

        await client.query(updateQuery, [
            articleData.number,
            articleData.title,
            articleData.customer,
            articleData.area,
            articleData.drainage,
            articleData.anodic,
            articleData.note,
            articleData.modifiedBy,
            id
        ]);
    }

    static async updateSequence(client, id, sequence) {
        // Lösche alte Sequenz
        await client.query('DELETE FROM sequence WHERE article_id = $1', [id]);
        
        if (sequence?.length > 0) {
            const sequenceQuery = `
                INSERT INTO sequence (
                    article_id, position_id, order_number,
                    time_preset, current_preset, voltage_preset
                ) VALUES ($1, $2, $3, $4, $5, $6)`;

            await Promise.all(sequence.map(seq =>
                client.query(sequenceQuery, [
                    id,
                    seq.positionId,
                    seq.orderNumber,
                    seq.timePreset,
                    seq.currentPreset,
                    seq.voltagePreset
                ])
            ));
        }
    }

    static async getArticleWithSequence(client, id) {
        const query = `
            SELECT 
                a.*,
                json_agg(
                    json_build_object(
                        'positionId', s.position_id,
                        'orderNumber', s.order_number,
                        'timePreset', s.time_preset,
                        'currentPreset', s.current_preset,
                        'voltagePreset', s.voltage_preset,
                        'positionName', p.position_name
                    ) ORDER BY s.order_number
                ) FILTER (WHERE s.id IS NOT NULL) as sequence
            FROM article a
            LEFT JOIN sequence s ON a.id = s.article_id
            LEFT JOIN position p ON s.position_id = p.id
            WHERE a.id = $1
            GROUP BY a.id`;

        const result = await client.query(query, [id]);
        return result.rows[0];
    }

    static async updateArticle(id, articleData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update Artikel-Daten
            await ArticleService.updateArticleData(client, id, articleData);

            // Update Sequenz
            await ArticleService.updateSequence(client, id, articleData.sequence);

            // Hole aktualisierten Artikel mit Sequenz
            const updatedArticle = await ArticleService.getArticleWithSequence(client, id);
            
            await client.query('COMMIT');
            
            return ArticleService.transformArticleData([updatedArticle])[0];
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error updating article:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async deleteArticle(id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Lösche zuerst die Sequenzen
            await client.query('DELETE FROM sequence WHERE article_id = $1', [id]);
            
            // Dann den Artikel
            await client.query('DELETE FROM article WHERE id = $1', [id]);
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error deleting article:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

export default ArticleService;