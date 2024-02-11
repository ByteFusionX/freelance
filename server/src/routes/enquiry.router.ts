import { Router } from "express";
const upload = require("../common/multer.storage")
import {
    createEnquiry,
    getEnquiries,
    getPreSaleJobs,
    updateEnquiryStatus,
    totalEnquiries,
    monthlyEnquiries,
    uploadAssignFiles
} from "../controllers/enquiry.controller";
const equiRouter = Router()

equiRouter.post('/create', upload.fields([{ name: 'attachments' }, { name: 'presaleFiles' }]), createEnquiry);
equiRouter.post('/get', getEnquiries);
equiRouter.get('/presales', getPreSaleJobs);
equiRouter.put('/update', updateEnquiryStatus);
equiRouter.get('/sum', totalEnquiries);
equiRouter.get('/monthly', monthlyEnquiries);
equiRouter.post('/assign-files', upload.array('assignFiles', 5), uploadAssignFiles)

export default equiRouter;