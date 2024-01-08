import { Router } from "express";
import { assignToPreSales, getPreSalesData } from "../controllers/enquiry.controler";
const equiRouter = Router()

equiRouter.post('/assignToPreSales',assignToPreSales)
equiRouter.get('/getPreSales',getPreSalesData)

export default equiRouter;