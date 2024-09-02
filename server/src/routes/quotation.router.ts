import { Router } from "express";
import {  approveDeal, getDealSheet, getNextQuoteId, getQuotations, getReportDetails, markAsQuotationSeened, markAsSeenDeal, rejectDeal, saveDealSheet, saveQuotation, totalQuotation, updateQuotation, updateQuoteStatus, uploadLpo } from "../controllers/quotation.controller";
const quoteRouter = Router()
const upload = require("../common/multer.storage")


quoteRouter.post('/', saveQuotation)
quoteRouter.post('/lpo',upload.array('files'), uploadLpo)
quoteRouter.patch('/status/:quoteId', updateQuoteStatus)
quoteRouter.patch('/update/:quoteId', updateQuotation)
quoteRouter.patch('/deal/:quoteId', saveDealSheet)
quoteRouter.post('/deal/approve', approveDeal)
quoteRouter.post('/deal/reject', rejectDeal)
quoteRouter.post('/deal/get', getDealSheet)
quoteRouter.post('/get', getQuotations)
quoteRouter.post('/report', getReportDetails)
quoteRouter.get('/total', totalQuotation)
quoteRouter.post('/nextQuoteId', getNextQuoteId)
quoteRouter.post('/markAsSeenedDeal', markAsSeenDeal);
quoteRouter.post('/markAsQuotationSeened', markAsQuotationSeened);

export default quoteRouter;