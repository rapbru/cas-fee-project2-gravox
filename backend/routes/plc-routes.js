import express from 'express';
import { plcController } from '../controller/plc-controller.js';

const router = express.Router();
const plcRoutes = router;

router.get("/", plcController.getAllValues);
router.get("/:tagName", plcController.getTagValue);
router.post("/write", plcController.writeTagValue);
// router.put("/:id", plcController.doSomething);
// router.delete("/:id/", plcController.doSomething);

export default plcRoutes;