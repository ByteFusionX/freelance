import { Router } from "express";
import { createEmployee, getEmployees, login, getEmployee } from "../controllers/employee.controller";
const empRouter = Router()

empRouter.get('/', getEmployees)
empRouter.post('/', createEmployee)
empRouter.post('/login', login)
empRouter.get('/get/:id', getEmployee)

export default empRouter;