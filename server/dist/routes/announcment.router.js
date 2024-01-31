"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announcment_controller_1 = require("../controllers/announcment.controller");
const annoRouter = (0, express_1.Router)();
annoRouter.post('/addAcnnouncement', announcment_controller_1.createAnnouncement);
annoRouter.get('/getAcnnouncement', announcment_controller_1.getAnnouncement);
exports.default = annoRouter;
//# sourceMappingURL=announcment.router.js.map