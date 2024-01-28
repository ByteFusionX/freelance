import { Router } from "express";
import {
    createEnquiry,
    getEnquiries,
    getPreSaleJobs,
    updateEnquiryStatus,
    totalEnquiries,
    monthlyEnquiries
} from "../controllers/enquiry.controler";
const equiRouter = Router()

equiRouter.post('/create', createEnquiry);
equiRouter.post('/get', getEnquiries);
equiRouter.get('/presales', getPreSaleJobs);
equiRouter.put('/update', updateEnquiryStatus);
equiRouter.get('/sum', totalEnquiries);
equiRouter.get('/monthly', monthlyEnquiries);

export default equiRouter;