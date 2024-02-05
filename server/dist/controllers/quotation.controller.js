"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuotation = exports.updateQuoteStatus = exports.getQuotations = exports.saveQuotation = void 0;
const quotation_model_1 = __importDefault(require("../models/quotation.model"));
const department_model_1 = __importDefault(require("../models/department.model"));
const employee_model_1 = __importDefault(require("../models/employee.model"));
const saveQuotation = async (req, res, next) => {
    try {
        const quoteData = req.body;
        let quoteId = await generateQuoteId(quoteData.department, quoteData.createdBy, quoteData.date);
        quoteData.quoteId = quoteId;
        console.log(quoteId, quoteData);
        const quote = new quotation_model_1.default(quoteData);
        const saveQuote = await (await quote.save()).populate('department');
        if (saveQuote) {
            return res.status(200).json(saveQuote);
        }
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.saveQuotation = saveQuotation;
const getQuotations = async (req, res, next) => {
    try {
        let quoteData = await quotation_model_1.default.aggregate([
            {
                $lookup: {
                    from: 'customers',
                    localField: 'client',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            {
                $unwind: '$client'
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $unwind: '$department',
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                }
            },
            {
                $unwind: '$createdBy',
            },
            {
                $addFields: {
                    attention: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: '$client.contactDetails',
                                    as: 'contact',
                                    cond: {
                                        $eq: ['$$contact._id', '$attention']
                                    }
                                }
                            },
                            0
                        ]
                    }
                }
            }
        ]);
        if (!quoteData.length)
            return res.status(504).json({ err: 'No quote data found' });
        return res.status(200).json(quoteData);
    }
    catch (error) {
        console.log(error);
    }
};
exports.getQuotations = getQuotations;
const generateQuoteId = async (departmentId, employeeId, date) => {
    try {
        const lastQuote = await quotation_model_1.default.findOne({}, {}, { sort: { quoteId: -1 } });
        const department = await department_model_1.default.findById(departmentId);
        const employee = await employee_model_1.default.findById(employeeId);
        let lastQuoteId;
        let quoteId;
        if (lastQuote) {
            lastQuoteId = lastQuote.quoteId;
        }
        if (employee && department) {
            const salesId = `${employee.firstName[0]}${employee.lastName[0]}`;
            const departmentName = department.departmentName.split(' ')[0].replace(/\s/g, "").toUpperCase().slice(0, 4);
            const [year, month] = date.split('-');
            const formatedDate = `${month}/${year.substring(2)}`;
            if (lastQuote && lastQuoteId) {
                const IdNumber = lastQuoteId.split('-');
                const incrementedNum = parseInt(IdNumber[3]) + 1;
                const formattedIncrementedNum = String(incrementedNum).padStart(3, '0');
                quoteId = `QN-NT/${salesId}/${departmentName}-${formatedDate}-${formattedIncrementedNum}`;
            }
            else {
                quoteId = `QN-NT/${salesId}/${departmentName}-${formatedDate}-001`;
            }
        }
        return quoteId;
    }
    catch (error) {
        console.log(error);
    }
};
const updateQuoteStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { quoteId } = req.params;
        const quoteUpdated = await quotation_model_1.default.findByIdAndUpdate(quoteId, { status: status });
        if (quoteUpdated) {
            return res.status(200).json(quoteUpdated.status);
        }
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuoteStatus = updateQuoteStatus;
const updateQuotation = async (req, res, next) => {
    try {
        const quoteData = req.body;
        const { quoteId } = req.params;
        const quoteUpdated = await quotation_model_1.default.findByIdAndUpdate(quoteId, quoteData);
        if (quoteUpdated) {
            return res.status(200).json(quoteUpdated);
        }
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuotation = updateQuotation;
//# sourceMappingURL=quotation.controller.js.map