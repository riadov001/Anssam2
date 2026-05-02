import { Router, type IRouter } from "express";
import healthRouter from "./health";
import videosRouter from "./videos";
import eventsRouter from "./events";
import placesRouter from "./places";
import aiChatRouter from "./ai-chat";
import adminAuthRouter from "./admin-auth";
import adminSettingsRouter from "./admin-settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(videosRouter);
router.use(eventsRouter);
router.use(placesRouter);
router.use(aiChatRouter);
router.use(adminAuthRouter);
router.use(adminSettingsRouter);

export default router;
