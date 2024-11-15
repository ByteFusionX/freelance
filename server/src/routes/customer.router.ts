import { Router } from "express";

import { createCustomer, getAllCustomers, getCustomerCreators, getFilteredCustomers, editCustomer, getCustomerByCustomerId } from "../controllers/customer.controller";
const cusRouter = Router()

cusRouter.get('/',getAllCustomers)
cusRouter.get('/view/get/:customerId', getCustomerByCustomerId)
cusRouter.post('/',createCustomer)
cusRouter.post('/get',getFilteredCustomers)
cusRouter.get('/creators',getCustomerCreators)
cusRouter.patch('/edit', editCustomer)

export default cusRouter;