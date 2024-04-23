import { Router } from "express";
import { jobList, totalJob, updateJobStatus } from "../controllers/job.controller";
const jobRouter = Router()

jobRouter.post('/getJobs',jobList)
jobRouter.patch('/status/:jobId', updateJobStatus)
jobRouter.get('/total', totalJob)


export default jobRouter