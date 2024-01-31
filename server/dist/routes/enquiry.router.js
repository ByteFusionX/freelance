"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enquiry_controler_1 = require("../controllers/enquiry.controler");
const equiRouter = (0, express_1.Router)();
equiRouter.post('/create', enquiry_controler_1.createEnquiry);
equiRouter.post('/get', enquiry_controler_1.getEnquiries);
equiRouter.get('/presales', enquiry_controler_1.getPreSaleJobs);
equiRouter.put('/update', enquiry_controler_1.updateEnquiryStatus);
equiRouter.get('/sum', enquiry_controler_1.totalEnquiries);
equiRouter.get('/monthly', enquiry_controler_1.monthlyEnquiries);
exports.default = equiRouter;
//# sourceMappingURL=enquiry.router.js.map