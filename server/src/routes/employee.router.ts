import { Router } from "express";
import { createEmployee, getEmployee } from "../controllers/employee.controller";
const empRouter = Router()

empRouter.get('/',getEmployee)
empRouter.post('/',createEmployee)

export default empRouter;