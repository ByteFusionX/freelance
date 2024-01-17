import { Router } from "express";
import { createEnquiry, getEnquiries, getPreSaleJobs, updateEnquiryStatus } from "../controllers/enquiry.controler";
const equiRouter = Router()

equiRouter.post('/create', createEnquiry)
equiRouter.get('/get', getEnquiries)
equiRouter.get('/presales', getPreSaleJobs)
equiRouter.put('/update', updateEnquiryStatus)

export default equiRouter;