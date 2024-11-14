import { Router } from "express";
import { createCustomerDepartment, createDepartment, getCustomerDepartments, getDepartments, totalEnquiries, updateCustomerDepartment, updateDepartment } from "../controllers/department.controller";
const depRouter = Router()

depRouter.get('/',getDepartments)
depRouter.post('/',createDepartment)
depRouter.put('/',updateDepartment)
depRouter.get('/customer',getCustomerDepartments)
depRouter.post('/customer',createCustomerDepartment)
depRouter.put('/customer',updateCustomerDepartment)
depRouter.get('/enquiry-count', totalEnquiries);

export default depRouter;