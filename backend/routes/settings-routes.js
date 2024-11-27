import express from 'express';
import { settingsController } from '../controller/settings-controller.js';

const router = express.Router();

router.get("/columns", settingsController.getColumnSettings);
router.post("/columns", settingsController.saveColumnSettings);
router.get("/position-order", settingsController.getPositionOrder);
router.post("/position-order", settingsController.savePositionOrder);

export default router; 