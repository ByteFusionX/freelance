import { Router } from "express";
import { createDepartment, getDepartments } from "../controllers/department.controller";
const depRouter = Router()

depRouter.get('/',getDepartments)
depRouter.post('/',createDepartment)

export default depRouter;