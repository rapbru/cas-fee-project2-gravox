import SettingsService from '../services/settings-service.js';
import SettingsMockService from '../mock/settings-mock-service.js';

export class SettingsController {
    constructor() {
        if (process.env.NODE_ENV === "production") {
            this.settingsService = new SettingsService();
        } else {
            this.settingsService = new SettingsMockService();
        }
    }

    getColumnSettings = async (req, res) => {
        try {
            const settings = await this.settingsService.getColumnSettings();
            return res.json(settings);
        } catch (err) {
            return res.status(500).json({ error: 'Fehler beim Laden der Spalteneinstellungen' });
        }
    };

    saveColumnSettings = async (req, res) => {
        try {
            const settings = req.body;
            const savedSettings = await this.settingsService.saveColumnSettings(settings);
            return res.json(savedSettings);
        } catch (err) {
            return res.status(500).json({ error: 'Fehler beim Speichern der Spalteneinstellungen' });
        }
    };

    getPositionOrder = async (req, res) => {
        try {
            const order = await this.settingsService.getPositionOrder();
            return res.json(order);
        } catch (error) {
            return res.status(500).json({ 
                error: 'Fehler beim Laden der Positionsreihenfolge' 
            });
        }
    };

    savePositionOrder = async (req, res) => {
        try {
            const { positions } = req.body;
            
            if (!Array.isArray(positions)) {
                return res.status(400).json({ 
                    error: 'Ungültiges Format für Positionsreihenfolge' 
                });
            }

            await this.settingsService.savePositionOrder(positions);
            return res.json({ 
                message: 'Positionsreihenfolge erfolgreich gespeichert' 
            });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Fehler beim Speichern der Positionsreihenfolge' 
            });
        }
    };
}

export const settingsController = new SettingsController(); 