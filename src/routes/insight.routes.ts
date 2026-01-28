import { Router } from "express";
import { getGraphData, getInsights, getUniqueFilters, getWidgets } from "../controller/insight.controller";

const router = Router();

router.get("/", getInsights);
router.get("/filters", getUniqueFilters)
router.get("/widgets", getWidgets);
router.get("/graphs", getGraphData);

export default router;
