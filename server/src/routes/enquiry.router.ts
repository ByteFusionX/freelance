import { Router } from "express";
const upload = require("../common/multer.storage")
import {
    createEnquiry,
    getEnquiries,
    getPreSaleJobs,
    updateEnquiryStatus,
    monthlyEnquiries,
    uploadAssignFiles,
    sendFeedbackRequest,
    getFeedbackRequestsById,
    giveFeedback,
    assignPresale,
    giveRevision,
    presalesCount,
    markAsSeenJob,
    markAsSeenFeeback
} from "../controllers/enquiry.controller";
const equiRouter = Router()

equiRouter.post('/create', upload.fields([{ name: 'attachments' }, { name: 'presaleFiles' }]), createEnquiry);
equiRouter.post('/get', getEnquiries);
equiRouter.get('/presales', getPreSaleJobs);
equiRouter.patch('/presales/:enquiryId', upload.fields([{ name: 'presaleFiles' }]), assignPresale);
equiRouter.put('/update', updateEnquiryStatus);
equiRouter.get('/monthly', monthlyEnquiries);
equiRouter.patch('/feedback-request', sendFeedbackRequest);
equiRouter.patch('/give-feedback', giveFeedback);
equiRouter.patch('/revision/:enquiryId', giveRevision);
equiRouter.get('/feedback-request/:employeeId', getFeedbackRequestsById);
equiRouter.post('/assign-files', upload.array('assignFiles', 5), uploadAssignFiles)
equiRouter.post('/markAsSeenedJob', markAsSeenJob);
equiRouter.post('/markAsSeenFeeback', markAsSeenFeeback);
equiRouter.get('/presales/count', presalesCount)


export default equiRouter;