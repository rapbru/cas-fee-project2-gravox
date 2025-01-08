import express from 'express';
import { plcController } from '../controller/plc-controller.js';

const router = express.Router();
const plcRoutes = router;

router.get("/read", plcController.getAllValues);
router.post("/read", plcController.getTagValue);
router.post("/write", plcController.writeTagValue);
router.get("/structure/:tagname/:nbr", plcController.getStructureByNumber);
router.post("/load/:id", plcController.loadArticleToPlc);

export default plcRoutes;