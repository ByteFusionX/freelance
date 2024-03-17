import { Router } from "express";
import { getQuotations, saveQuotation, totalQuotation, updateQuotation, updateQuoteStatus, uploadLpo } from "../controllers/quotation.controller";
const quoteRouter = Router()
const upload = require("../common/multer.storage")


quoteRouter.post('/', saveQuotation)
quoteRouter.post('/lpo',upload.array('files'), uploadLpo)
quoteRouter.patch('/status/:quoteId', updateQuoteStatus)
quoteRouter.patch('/update/:quoteId', updateQuotation)
quoteRouter.post('/get', getQuotations)
quoteRouter.get('/total', totalQuotation)

export default quoteRouter;