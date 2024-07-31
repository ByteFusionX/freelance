import { Router } from "express";
import {  approveDeal, getDealSheet, getNextQuoteId, getQuotations, saveDealSheet, saveQuotation, totalQuotation, updateQuotation, updateQuoteStatus, uploadLpo } from "../controllers/quotation.controller";
const quoteRouter = Router()
const upload = require("../common/multer.storage")


quoteRouter.post('/', saveQuotation)
quoteRouter.post('/lpo',upload.array('files'), uploadLpo)
quoteRouter.patch('/status/:quoteId', updateQuoteStatus)
quoteRouter.patch('/update/:quoteId', updateQuotation)
quoteRouter.patch('/deal/:quoteId', saveDealSheet)
quoteRouter.post('/deal/approve', approveDeal)
quoteRouter.post('/deal/get', getDealSheet)
quoteRouter.post('/get', getQuotations)
quoteRouter.get('/total', totalQuotation)
quoteRouter.post('/nextQuoteId', getNextQuoteId)

export default quoteRouter;