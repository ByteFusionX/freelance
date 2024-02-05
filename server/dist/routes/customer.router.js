"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const cusRouter = (0, express_1.Router)();
cusRouter.get('/', customer_controller_1.getCustomers);
cusRouter.post('/', customer_controller_1.createCustomer);
exports.default = cusRouter;
//# sourceMappingURL=customer.router.js.map