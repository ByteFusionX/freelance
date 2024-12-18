import { Router } from "express";
const upload = require("../common/multer.storage")
import {
    createEnquiry,
    getEnquiries,
    getPreSaleJobs,
    updateEnquiryStatus,
    monthlyEnquiries,
    sendFeedbackRequest,
    getFeedbackRequestsById,
    giveFeedback,
    assignPresale,
    giveRevision,
    reviseQuoteEstimation,
    presalesCount,
    markAsSeenJob,
    markAsSeenFeedback,
    markFeedbackResponseAsViewed,
    uploadEstimations,
    markAsSeenEstimation,
    deleteEnquiry,
    deleteEstimation,
    RejectPresaleJob
} from "../controllers/enquiry.controller";
const equiRouter = Router()

equiRouter.post('/create', upload.fields([{ name: 'attachments' }, { name: 'presaleFiles' }]), createEnquiry);
equiRouter.post('/get', getEnquiries);
equiRouter.get('/presales', getPreSaleJobs);
equiRouter.patch('/presales/:enquiryId', upload.fields([{ name: 'newPresaleFile' }]), assignPresale);
equiRouter.put('/update', updateEnquiryStatus);
equiRouter.get('/monthly', monthlyEnquiries);
equiRouter.patch('/feedback-request', sendFeedbackRequest);
equiRouter.patch('/give-feedback', giveFeedback);
equiRouter.patch('/revision/:enquiryId', giveRevision);
equiRouter.patch('/quoteRevision/:enquiryId', reviseQuoteEstimation);
equiRouter.get('/feedback-request/:employeeId', getFeedbackRequestsById);
equiRouter.post('/upload-estimation', uploadEstimations)
equiRouter.post('/markAsSeenEstimation', markAsSeenEstimation);
equiRouter.post('/markAsSeenedJob', markAsSeenJob);
equiRouter.post('/markAsSeenFeeback', markAsSeenFeedback);
equiRouter.patch('/markAsSeenFeebackResponse', markFeedbackResponseAsViewed);
equiRouter.get('/presales/count', presalesCount)
equiRouter.post('/delete', deleteEnquiry);
equiRouter.delete('/presales/estimation/:enqId', deleteEstimation)
equiRouter.put('/presales/reject', RejectPresaleJob)


export default equiRouter;