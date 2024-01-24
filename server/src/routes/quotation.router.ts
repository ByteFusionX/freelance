import { Router } from "express";
import { getQuotations, saveQuotation, totalQuotation, updateQuotation, updateQuoteStatus } from "../controllers/quotation.controller";
const quoteRouter = Router()

quoteRouter.post('/', saveQuotation)
quoteRouter.patch('/status/:quoteId', updateQuoteStatus)
quoteRouter.patch('/update/:quoteId', updateQuotation)
quoteRouter.get('/', getQuotations)
quoteRouter.get('/total', totalQuotation)

export default quoteRouter;