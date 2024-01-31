import { Router } from "express";
import { createCustomer, getAllCustomers, getCustomerCreators, getFilteredCustomers } from "../controllers/customer.controller";
const cusRouter = Router()

cusRouter.get('/',getAllCustomers)
cusRouter.post('/',createCustomer)
cusRouter.post('/get',getFilteredCustomers)
cusRouter.get('/creators',getCustomerCreators)

export default cusRouter;