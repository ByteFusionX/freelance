import { Router } from "express";
import { createCustomer, getCustomers } from "../controllers/customer.controller";
const cusRouter = Router()

cusRouter.get('/',getCustomers)
cusRouter.post('/',createCustomer)

export default cusRouter;