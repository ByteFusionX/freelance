import { Router } from "express";
import { getQuotations, saveQuotation, updateQuotation } from "../controllers/quotation.controller";
const quoteRouter = Router()

quoteRouter.post('/', saveQuotation)
quoteRouter.patch('/status/:quoteId', updateQuotation)
quoteRouter.get('/', getQuotations)

export default quoteRouter;