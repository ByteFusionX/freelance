import { Router } from "express";
const upload = require("../common/multer.storage")
import {
    createEnquiry,
    getEnquiries,
    getPreSaleJobs,
    updateEnquiryStatus,
    totalEnquiries,
    monthlyEnquiries
} from "../controllers/enquiry.controller";
const equiRouter = Router()

equiRouter.post('/create', upload.array('attachments', 12), createEnquiry);
equiRouter.post('/get', getEnquiries);
equiRouter.get('/presales', getPreSaleJobs);
equiRouter.put('/update', updateEnquiryStatus);
equiRouter.get('/sum', totalEnquiries);
equiRouter.get('/monthly', monthlyEnquiries);

export default equiRouter;