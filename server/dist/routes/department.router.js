"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = require("../controllers/department.controller");
const depRouter = (0, express_1.Router)();
depRouter.get('/', department_controller_1.getDepartments);
depRouter.post('/', department_controller_1.createDepartment);
depRouter.put('/', department_controller_1.updateDepartment);
exports.default = depRouter;
//# sourceMappingURL=department.router.js.map