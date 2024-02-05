"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quotation_controller_1 = require("../controllers/quotation.controller");
const quoteRouter = (0, express_1.Router)();
quoteRouter.post('/', quotation_controller_1.saveQuotation);
quoteRouter.patch('/status/:quoteId', quotation_controller_1.updateQuoteStatus);
quoteRouter.patch('/update/:quoteId', quotation_controller_1.updateQuotation);
quoteRouter.get('/', quotation_controller_1.getQuotations);
exports.default = quoteRouter;
//# sourceMappingURL=quotation.router.js.map