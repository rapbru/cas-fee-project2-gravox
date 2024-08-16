import express from 'express';
import { plcController } from '../controller/plc-controller.js';

const router = express.Router();
const plcRoutes = router;

router.get("/", plcController.getPlcValues);
router.get("/:tagName", plcController.getTagValue);
// router.post("/", plcController.doSomething);
// router.put("/:id", plcController.doSomething);
// router.delete("/:id/", plcController.doSomething);

export default plcRoutes;