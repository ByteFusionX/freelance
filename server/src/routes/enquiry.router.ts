import { Router } from "express";
import { createEnquiry, getEnquiries, getPreSaleJobs } from "../controllers/enquiry.controler";
const equiRouter = Router()

equiRouter.post('/create', createEnquiry)
equiRouter.get('/get', getEnquiries)
equiRouter.get('/presales', getPreSaleJobs)

export default equiRouter;