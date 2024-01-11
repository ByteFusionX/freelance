import { Router } from "express";
import { createEmployee, getEmployee,login } from "../controllers/employee.controller";
const empRouter = Router()

empRouter.get('/',getEmployee)
empRouter.post('/',createEmployee)
empRouter.post('/login',login)

export default empRouter;