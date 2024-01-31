"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_controller_1 = require("../controllers/employee.controller");
const empRouter = (0, express_1.Router)();
empRouter.get('/', employee_controller_1.getEmployees);
empRouter.post('/', employee_controller_1.createEmployee);
empRouter.post('/login', employee_controller_1.login);
empRouter.get('/get/:id', employee_controller_1.getEmployee);
exports.default = empRouter;
//# sourceMappingURL=employee.router.js.map