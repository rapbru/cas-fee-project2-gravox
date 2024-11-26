import SettingsService from '../services/settings-service.js';

export class SettingsController {
    constructor() {
        this.settingsService = new SettingsService();
    }

    getColumnSettings = async (req, res) => {
        try {
            const settings = await this.settingsService.getColumnSettings();
            return res.json(settings);
        } catch (err) {
            console.error('Error loading column settings:', err);
            return res.status(500).json({ error: 'Fehler beim Laden der Spalteneinstellungen' });
        }
    };

    saveColumnSettings = async (req, res) => {
        try {
            const settings = req.body;
            const savedSettings = await this.settingsService.saveColumnSettings(settings);
            return res.json(savedSettings);
        } catch (err) {
            console.error('Error saving column settings:', err);
            return res.status(500).json({ error: 'Fehler beim Speichern der Spalteneinstellungen' });
        }
    };
}

export const settingsController = new SettingsController(); 