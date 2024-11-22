import { Router } from "express";
import {
    createCustomerDepartment,
    createDepartment,
    createInternalDepartment,
    getCustomerDepartments,
    getDepartments,
    getInternalDepartments,
    totalEnquiries,
    updateCustomerDepartment,
    updateDepartment,
    updateInternalDepartment
} from "../controllers/department.controller";
const depRouter = Router()

depRouter.get('/', getDepartments)
depRouter.post('/', createDepartment)
depRouter.put('/', updateDepartment)
depRouter.get('/customer', getCustomerDepartments)
depRouter.post('/customer', createCustomerDepartment)
depRouter.put('/customer', updateCustomerDepartment)
depRouter.get('/enquiry-count', totalEnquiries);
depRouter.get('/internalDepartment', getInternalDepartments)
depRouter.post('/internalDepartment', createInternalDepartment)
depRouter.put('/internalDepartment', updateInternalDepartment)

export default depRouter;