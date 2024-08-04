import { Router } from "express";
import { createDepartment, getDepartments, totalEnquiries, updateDepartment } from "../controllers/department.controller";
const depRouter = Router()

depRouter.get('/',getDepartments)
depRouter.post('/',createDepartment)
depRouter.put('/',updateDepartment)
depRouter.get('/enquiry-count', totalEnquiries);

export default depRouter;