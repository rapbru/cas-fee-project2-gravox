import express from 'express';
import { positionController } from '../controller/position-controller.js';

const router = express.Router();
const positionRoutes = router;

router.get("/", positionController.getAllPositions);
router.get("/:id", positionController.getPositionById);

export default positionRoutes;