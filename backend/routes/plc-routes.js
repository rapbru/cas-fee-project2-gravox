import express from 'express';
import { plcController } from '../controller/plc-controller.js';

const router = express.Router();
const plcRoutes = router;

router.get("/read", plcController.getAllValues);
router.post("/read", plcController.getTagValue);
router.post("/write", plcController.writeTagValue);

export default plcRoutes;