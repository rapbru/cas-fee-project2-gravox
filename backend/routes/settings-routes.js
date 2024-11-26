import express from 'express';
import { settingsController } from '../controller/settings-controller.js';

const router = express.Router();

router.get("/columns", settingsController.getColumnSettings);
router.post("/columns", settingsController.saveColumnSettings);

export default router; 