import { Router } from "express";
import { createEmployee, getEmployees, login, getEmployee, getFilteredEmployees } from "../controllers/employee.controller";
const empRouter = Router()

empRouter.get('/', getEmployees)
empRouter.post('/get', getFilteredEmployees)
empRouter.post('/', createEmployee)
empRouter.post('/login', login)
empRouter.get('/get/:id', getEmployee)

export default empRouter;