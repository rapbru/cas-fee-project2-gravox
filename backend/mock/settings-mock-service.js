class SettingsMockService {
    constructor() {
        this.settings = {
            column_settings: {
                column_count: 2,
                positions_per_column: [13, 10]
            },
            position_order: [
                { position_id: 50, order_index: 1 },
                { position_id: 51, order_index: 2 },
                { position_id: 52, order_index: 3 },
                { position_id: 1, order_index: 4 },
                { position_id: 2, order_index: 5 },
                { position_id: 3, order_index: 6 },
                { position_id: 4, order_index: 7 },
                { position_id: 5, order_index: 8 },
                { position_id: 6, order_index: 9 },
                { position_id: 8, order_index: 10 },
                { position_id: 9, order_index: 11 },
                { position_id: 10, order_index: 12 },
                { position_id: 11, order_index: 13 },
                { position_id: 12, order_index: 14 },
                { position_id: 13, order_index: 15 },
                { position_id: 14, order_index: 16 },
                { position_id: 15, order_index: 17 },
                { position_id: 16, order_index: 18 },
                { position_id: 17, order_index: 19 },
                { position_id: 18, order_index: 20 },   
                { position_id: 19, order_index: 21 },
                { position_id: 20, order_index: 22 },
                { position_id: 21, order_index: 23 }
            ]
        };
    }

    async getColumnSettings() {
        return this.settings.column_settings;
    }

    async updateColumnSettings(settings) {
        this.settings.column_settings = {
            column_count: settings.column_count,
            positions_per_column: [...settings.positions_per_column]
        };
        return true;
    }

    async getPositionOrder() {
        return this.settings.position_order;
    }

    async updatePositionOrder(order) {
        this.settings.position_order = [...order];
        return true;
    }

    async savePositionOrder(positions) {
        this.settings.position_order = positions.map((positionId, index) => ({
            position_id: positionId,
            order_index: index
        }));
        return true;
    }

    async saveColumnSettings(settings) {
        this.settings.column_settings = {
            column_count: settings.columnCount,
            positions_per_column: [...settings.positionsPerColumn]
        };
        return this.settings.column_settings;
    }
}

export default SettingsMockService; 