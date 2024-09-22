import { Router } from "express";
import { getDashboardMetrics } from "../controllers/dashboard.controller";

const dashboardRouter = Router()

dashboardRouter.post('/metrics', getDashboardMetrics)

export default dashboardRouter;