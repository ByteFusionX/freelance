import { Router } from "express";
import { getJobSalesPerson, jobList, totalJob, updateJobStatus } from "../controllers/job.controller";
const jobRouter = Router()

jobRouter.post('/getJobs',jobList)
jobRouter.patch('/status/:jobId', updateJobStatus)
jobRouter.get('/total', totalJob)
jobRouter.get('/sales', getJobSalesPerson)


export default jobRouter