import { Router } from "express";
import { createEmployee, getEmployees, login, getEmployee, getFilteredEmployees, editEmployee, getPasswordForEmployee } from "../controllers/employee.controller";
const empRouter = Router()

empRouter.get('/', getEmployees)
empRouter.post('/get', getFilteredEmployees)
empRouter.post('/', createEmployee)
// empRouter.get('/getPasswordOfEmployee/:id', getPasswordForEmployee)
empRouter.patch('/changePasswordOfEmployee',)
empRouter.patch('/edit', editEmployee)
empRouter.post('/login', login)
empRouter.get('/get/:id', getEmployee)

export default empRouter;