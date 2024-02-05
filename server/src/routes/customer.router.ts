import { Router } from "express";
import { createCustomer, editCustomer, getCustomers } from "../controllers/customer.controller";
const cusRouter = Router()

cusRouter.get('/', getCustomers)
cusRouter.patch('/edit', editCustomer)

export default cusRouter;