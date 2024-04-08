import { Router } from "express";
import { jobList, updateJobStatus } from "../controllers/job.controller";
const jobRouter = Router()

jobRouter.post('/getJobs',jobList)
jobRouter.patch('/status/:jobId', updateJobStatus)

export default jobRouter