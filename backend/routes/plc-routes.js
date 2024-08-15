import express from 'express';

const router = express.Router();
import { plcController } from '../controller/plc-controller.js'

router.get("/", plcController.getPlcValues);
router.get("/:tagName", plcController.getTagValue);
// router.post("/", plcController.doSomething);
// router.put("/:id", plcController.doSomething);
// router.delete("/:id/", plcController.doSomething);

export const plcRoutes = router;