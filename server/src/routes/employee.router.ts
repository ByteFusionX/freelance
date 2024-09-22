import { Router } from "express";
import { createEmployee, getEmployees, login, getEmployee, getFilteredEmployees, editEmployee, getEmployeeByEmployeId, isEmployeePresent, getNotificationCounts } from "../controllers/employee.controller";
const empRouter = Router()

empRouter.get('/', getEmployees)
empRouter.get('/check', isEmployeePresent)
empRouter.get('/view/get/:employeeId', getEmployeeByEmployeId)
empRouter.post('/get', getFilteredEmployees)
empRouter.post('/', createEmployee)
empRouter.patch('/changePasswordOfEmployee',)
empRouter.patch('/edit', editEmployee)
empRouter.post('/login', login)
empRouter.get('/get/:id', getEmployee)
empRouter.get('/notifications/:token', getNotificationCounts)

export default empRouter;