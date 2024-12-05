import { Router } from "express";
import { getJobSalesPerson, jobList, totalJob, updateJobStatus, deleteJob } from "../controllers/job.controller";
const jobRouter = Router()

jobRouter.post('/getJobs',jobList)
jobRouter.patch('/status/:jobId', updateJobStatus)
jobRouter.get('/total', totalJob)
jobRouter.get('/sales', getJobSalesPerson)
jobRouter.delete('/:id', deleteJob)


export default jobRouter