import { Router } from "express";
import { createEmployee, getEmployee,getEmployeeData,login } from "../controllers/employee.controller";
const empRouter = Router()

empRouter.get('/',getEmployee)
empRouter.post('/',createEmployee)
empRouter.post('/login',login)
empRouter.get('/getEmployeeData/:employeeId',getEmployeeData)

export default empRouter;