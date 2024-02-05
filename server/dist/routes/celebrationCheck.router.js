"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const celebrationCheck_controller_1 = require("../controllers/celebrationCheck.controller");
const celebRouter = (0, express_1.Router)();
celebRouter.get('/', celebrationCheck_controller_1.celebrationCheck);
exports.default = celebRouter;
//# sourceMappingURL=celebrationCheck.router.js.map