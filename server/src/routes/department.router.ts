import { Router } from "express";
import { createDepartment, getDepartments, updateDepartment } from "../controllers/department.controller";
const depRouter = Router()

depRouter.get('/',getDepartments)
depRouter.post('/',createDepartment)
depRouter.put('/',updateDepartment)

export default depRouter;