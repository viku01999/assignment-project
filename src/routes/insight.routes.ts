import { Router } from "express";
import { createInsights, deleteInsights, getGraphData, getInsights, getInsightsById, getUniqueFilters, getWidgets, updateInsights } from "../controller/insight.controller";

const router = Router();

router.get("/", getInsights);
router.get("/filters", getUniqueFilters)
router.get("/widgets", getWidgets);
router.get("/graphs", getGraphData);
router.post("/createInsights", createInsights)
router.get("/:id", getInsightsById);
router.put("/:id", updateInsights);
router.delete("/:id", deleteInsights);

export default router;
