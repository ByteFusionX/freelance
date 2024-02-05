"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyEnquiries = exports.totalEnquiries = exports.updateEnquiryStatus = exports.getPreSaleJobs = exports.getEnquiries = exports.createEnquiry = void 0;
const enquiry_model_1 = __importDefault(require("../models/enquiry.model"));
const { ObjectId } = require('mongodb');
const createEnquiry = async (req, res, next) => {
    try {
        if (!req.body)
            return res.status(204).json({ err: 'No data' });
        const enquiryData = req.body;
        enquiryData.date = new Date(enquiryData.date);
        const preSaleData = new enquiry_model_1.default(enquiryData);
        const savePreSaleData = await (await preSaleData.save()).populate(['client', 'department', 'salesPerson']);
        if (!savePreSaleData)
            return res.status(504).json({ err: 'Internal Error' });
        return res.status(200).json(preSaleData);
    }
    catch (error) {
        next(error);
    }
};
exports.createEnquiry = createEnquiry;
const getEnquiries = async (req, res, next) => {
    try {
        let { page, row, salesPerson, status, fromDate, toDate } = req.body;
        let skipNum = (page - 1) * row;
        let isSalesPerson = salesPerson == null ? true : false;
        let isStatus = status == null ? true : false;
        let isDate = fromDate == null || toDate == null ? true : false;
        let matchSalesPerson = {
            $and: [
                {
                    $and: [
                        { $or: [{ salesPerson: new ObjectId(salesPerson) }, { salesPerson: { $exists: isSalesPerson } }] },
                        { $or: [{ status: status }, { status: { $exists: isStatus } }] },
                    ]
                },
                {
                    $or: [
                        { $and: [{ date: { $gte: new Date(fromDate) } }, { date: { $lte: new Date(toDate) } }] },
                        { date: { $exists: isDate } }
                    ]
                }
            ]
        };
        const enquiryTotal = await enquiry_model_1.default.aggregate([
            {
                $match: matchSalesPerson
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            {
                $project: { total: 1, _id: 0 }
            }
        ]);
        const enquiryData = await enquiry_model_1.default.aggregate([
            {
                $match: matchSalesPerson
            },
            {
                $sort: { createdDate: -1 }
            },
            {
                $skip: skipNum
            },
            {
                $limit: row
            },
            {
                $lookup: { from: 'customers', localField: 'client', foreignField: '_id', as: 'client' }
            },
            {
                $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
            },
            {
                $lookup: { from: 'employees', localField: 'salesPerson', foreignField: '_id', as: 'salesPerson' }
            },
        ]);
        console.log(enquiryData[0]);
        if (!enquiryData.length)
            return res.status(504).json({ err: 'No enquiry data found' });
        return res.status(200).json({ total: enquiryTotal[0].total, enquiry: enquiryData });
    }
    catch (error) {
        next(error);
    }
};
exports.getEnquiries = getEnquiries;
const getPreSaleJobs = async (req, res, next) => {
    try {
        let page = Number(req.query.page);
        let row = Number(req.query.row);
        let skipNum = (page - 1) * row;
        const totalPresale = await enquiry_model_1.default.aggregate([
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            { $project: { _id: 0, total: 1 } }
        ]);
        const preSaleData = await enquiry_model_1.default.aggregate([
            {
                $match: { status: 'Assigned To Presales' }
            },
            {
                $sort: { createdDate: -1 }
            },
            {
                $skip: skipNum
            },
            {
                $limit: row
            },
            {
                $lookup: { from: 'customers', localField: 'client', foreignField: '_id', as: 'client' }
            },
            {
                $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
            },
            {
                $lookup: { from: 'employees', localField: 'salesPerson', foreignField: '_id', as: 'salesPerson' }
            }
        ]);
        if (preSaleData)
            return res.status(200).json({ total: totalPresale[0].total, enquiry: preSaleData });
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.getPreSaleJobs = getPreSaleJobs;
const updateEnquiryStatus = async (req, res, next) => {
    try {
        let data = req.body;
        const update = await enquiry_model_1.default.findOneAndUpdate({ _id: data.id }, { $set: { status: data.status } })
            .populate(['client', 'department', 'salesPerson']);
        if (update)
            return res.status(200).json(update);
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.updateEnquiryStatus = updateEnquiryStatus;
const totalEnquiries = async (req, res, next) => {
    try {
        const result = await enquiry_model_1.default.aggregate([
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $group: { _id: "$department", total: { $sum: 1 }, enquiry: { $push: '$$ROOT' } }
            },
            {
                $project: {
                    _id: 0,
                    department: '$_id',
                    // enquiry: 1,
                    total: 1
                }
            }
        ]);
        if (result)
            return res.status(200).json(result);
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.totalEnquiries = totalEnquiries;
const monthlyEnquiries = async (req, res, next) => {
    try {
        const result = await enquiry_model_1.default.aggregate([
            {
                $project: {
                    department: 1,
                    date: 1
                }
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
                $group: {
                    _id: {
                        department: '$department',
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        // day: { $dayOfMonth: '$date' }
                    },
                    total: { $sum: 1 },
                    enquiry: { $push: '$$ROOT' }
                }
            },
            {
                $project: {
                    _id: 0,
                    department: '$_id.department',
                    year: '$_id.year',
                    month: '$_id.month',
                    total: 1,
                    // enquiry: 1
                }
            }
        ]);
        if (result)
            return res.status(200).json(result);
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.monthlyEnquiries = monthlyEnquiries;
//# sourceMappingURL=enquiry.controler.js.map