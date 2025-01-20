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

            logger.info('Starting article creation with data:', articleData);

            // Validate positions exist
            if (articleData.sequence && articleData.sequence.length > 0) {
                const positionIds = articleData.sequence.map(seq => parseInt(seq.positionId, 10));
                logger.info('Checking positions:', positionIds);
                
                const positionCheckQuery = `
                    SELECT id, position_name FROM position 
                    WHERE id = ANY($1::int[])
                `;
                const existingPositions = await client.query(positionCheckQuery, [positionIds]);
                logger.info('Found positions:', existingPositions.rows);
                
                if (existingPositions.rows.length !== new Set(positionIds).size) {
                    const existingIds = new Set(existingPositions.rows.map(row => row.id));
                    const missingIds = [...new Set(positionIds)].filter(id => !existingIds.has(id));
                    throw new Error(`Positions not found: ${missingIds.join(', ')}`);
                }
            }

            // Insert article
            const articleQuery = `
                INSERT INTO article (
                    number, title, customer, area, drainage, 
                    anodic, note, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING id
            `;
            
            const articleValues = [
                articleData.number,
                articleData.title,
                articleData.customer,
                articleData.area,
                articleData.drainage,
                articleData.anodic,
                articleData.note,
                articleData.createdBy
            ];

            logger.info('Executing article query with values:', articleValues);
            
            const articleResult = await client.query(articleQuery, articleValues);
            const articleId = articleResult.rows[0].id;
            logger.info('Created article with ID:', articleId);

            // Insert sequences if present
            if (articleData.sequence && articleData.sequence.length > 0) {
                const sequenceQuery = `
                    INSERT INTO sequence (
                        article_id, position_id, order_number,
                        time_preset, current_preset, voltage_preset
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `;

                logger.info('Creating sequences for article:', articleId);

                try {
                    await Promise.all(
                        articleData.sequence.map(async (seq, index) => {
                            const sequenceValues = [
                                articleId,
                                parseInt(seq.positionId, 10),
                                seq.orderNumber,
                                parseFloat(seq.timePreset) || 0,
                                parseFloat(seq.currentPreset) || 0,
                                parseFloat(seq.voltagePreset) || 0
                            ];
                            logger.info(`Creating sequence ${index + 1}:`, sequenceValues);
                            return client.query(sequenceQuery, sequenceValues);
                        })
                    );
                } catch (seqError) {
                    logger.error('Error creating sequences:', seqError);
                    throw seqError;
                }
            }

            // Get complete article data
            const getArticleQuery = `
                SELECT 
                    a.*,
                    json_agg(
                        json_build_object(
                            'positionId', s.position_id,
                            'orderNumber', s.order_number,
                            'timePreset', s.time_preset,
                            'currentPreset', s.current_preset,
                            'voltagePreset', s.voltage_preset
                        ) ORDER BY s.order_number
                    ) FILTER (WHERE s.id IS NOT NULL) as sequence
                FROM article a
                LEFT JOIN sequence s ON a.id = s.article_id
                WHERE a.id = $1
                GROUP BY a.id`;

            const completeArticle = await client.query(getArticleQuery, [articleId]);
            
            await client.query('COMMIT');
            logger.info('Successfully created article with sequences');
            
            return completeArticle.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error in createArticle:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static transformArticleData(articles) {
        return articles.map(article => ({
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
            sequence: article.sequence
        }));
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
                            'positionName', p.position_name,
                            'presetCurrentAddress', p.preset_current,
                            'presetVoltageAddress', p.preset_voltage
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
                    parseInt(seq.positionId, 10),
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