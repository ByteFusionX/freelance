import { NextFunction, Request, Response } from "express"
import jobModel from "../models/job.model"
import Employee from '../models/employee.model';
import { calculateDiscountPrice, calculateDiscountPricePipe, getUSDRated } from "../common/util";


const { ObjectId } = require('mongodb')

export const jobList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page, search, row, status, salesPerson, selectedMonth, selectedYear, access, userId } = req.body;

        let isStatus = status == null ? true : false;
        let isSalesPerson = salesPerson == null ? true : false;
        let skipNum: number = (page - 1) * row;

        let matchFilters: any = {
            isDeleted: { $ne: true },
            $and: [
                {
                    $or: [
                        { jobId: { $regex: search, $options: 'i' } },
                        { 'clientDetails.companyName': { $regex: search, $options: 'i' } }
                    ]
                },
                { $or: [{ status: status }, { status: { $exists: isStatus } }] }
            ]
        };

        if (selectedMonth && selectedYear) {
            let startDate = new Date(selectedYear, selectedMonth - 1, 1);
            let endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
            matchFilters.$and.push({ createdDate: { $gte: startDate, $lte: endDate } });
        } else if (selectedYear) {
            let startDate = new Date(selectedYear, 0, 1);
            let endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
            matchFilters.$and.push({ createdDate: { $gte: startDate, $lte: endDate } });
        }

        let accessFilter = {};

        let employeesReportingToUser = await Employee.find({ reportingTo: userId }, '_id');
        let reportedToUserIds = employeesReportingToUser.map(employee => employee._id);

        switch (access) {
            case 'created':
                accessFilter = { 'salesPersonDetails._id': new ObjectId(userId) };
                break;
            case 'reported':
                accessFilter = { 'salesPersonDetails._id': { $in: reportedToUserIds } };
                break;
            case 'createdAndReported':
                accessFilter = {
                    $or: [
                        { 'salesPersonDetails._id': new ObjectId(userId) },
                        { 'salesPersonDetails._id': { $in: reportedToUserIds } }
                    ]
                };
                break;

            default:
                break;
        }

        console.log(access);
        


        const USDRates = await getUSDRated();
        const qatarUsdRate = USDRates.usd.qar;

        const jobData = await jobModel.aggregate([
            {
                $lookup: { from: 'quotations', localField: 'quoteId', foreignField: '_id', as: 'quotation' }
            },
            {
                $unwind: "$quotation"
            },
            {
                $match: { $or: [{ 'quotation.createdBy': new ObjectId(salesPerson) }, { 'quotation.createdBy': { $exists: isSalesPerson } }] }
            },
            {
                $lookup: { from: 'customers', localField: 'quotation.client', foreignField: '_id', as: 'clientDetails' }
            },
            {
                $unwind: "$clientDetails"
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
                $lookup: { from: 'departments', localField: 'quotation.department', foreignField: '_id', as: 'departmentDetails' }
            },
            {
                $lookup: { from: 'employees', localField: 'quotation.createdBy', foreignField: '_id', as: 'salesPersonDetails' }
            },
            {
                $addFields: {
                    attention: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: '$clientDetails.contactDetails',
                                    as: 'contact',
                                    cond: { $eq: ['$$contact._id', '$quotation.attention'] }
                                }
                            },
                            0
                        ]
                    },
                    lpoValue: {
                        $sum: {
                            $cond: [
                                { $eq: ['$quotation.currency', 'USD'] },
                                {
                                    $multiply: [
                                        calculateDiscountPricePipe('$quotation.dealData.updatedItems', '$quotation.totalDiscount'),
                                        qatarUsdRate
                                    ]
                                },
                                calculateDiscountPricePipe('$quotation.dealData.updatedItems', '$quotation.totalDiscount')
                            ]
                        }
                    },
                },
            },
            {
                $match: { ...accessFilter, ...matchFilters }
            },
        ]);


        const jobTotal: { total: number, lpoValueSum: number }[] = await jobModel.aggregate([

            {
                $lookup: { from: 'quotations', localField: 'quoteId', foreignField: '_id', as: 'quotation' }
            },
            {
                $unwind: "$quotation"
            },
            {
                $lookup: { from: 'employees', localField: 'quotation.createdBy', foreignField: '_id', as: 'salesPersonDetails' }
            },
            {
                $match: { $or: [{ 'quotation.createdBy': new ObjectId(salesPerson) }, { 'quotation.createdBy': { $exists: isSalesPerson } }] }
            },
            {
                $lookup: { from: 'customers', localField: 'quotation.client', foreignField: '_id', as: 'clientDetails' }
            },
            {
                $unwind: "$clientDetails"
            },
            {
                $match: { ...accessFilter, ...matchFilters }
            },
            {
                $count: "total"
            },
        ]).exec();



        const totalValues = jobData.reduce((acc, job) => {
            const quote = job?.quotation;
            if (quote.currency == 'USD') {
                const updatedItems = quote?.dealData?.updatedItems || [];
                acc.totalUSDValue += calculateDiscountPrice(quote, updatedItems);
            } else {
                const updatedItems = quote?.dealData?.updatedItems || [];
                acc.totalQARValue += calculateDiscountPrice(quote, updatedItems);
            }
            return acc;
        }, {
            totalUSDValue: 0,
            totalQARValue: 0,
        });

        const totalLpoValue = totalValues.totalQARValue + (totalValues.totalUSDValue * qatarUsdRate);


        if (jobTotal.length) {
            return res.status(200).json({ total: jobTotal[0].total, totalLpo: totalLpoValue, job: jobData });
        } else {
            return res.status(504).json({ err: 'No job data found' });
        }
    } catch (error) {
        next(error);
    }
};

export const totalJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { access, userId } = req.query;

        let accessFilter = {};

        let employeesReportingToUser = await Employee.find({ reportingTo: userId }, '_id');
        let reportedToUserIds = employeesReportingToUser.map(employee => employee._id);

        switch (access) {
            case 'created':
                accessFilter = { 'salesPersonDetails._id': new ObjectId(userId) };
                break;
            case 'reported':
                accessFilter = { 'salesPersonDetails._id': { $in: reportedToUserIds } };
                break;
            case 'createdAndReported':
                accessFilter = {
                    $or: [
                        { 'salesPersonDetails._id': new ObjectId(userId) },
                        { 'salesPersonDetails._id': { $in: reportedToUserIds } }
                    ]
                };
                break;

            default:
                break;
        }

        const jobTotal: { total: number }[] = await jobModel.aggregate([
            {
                $match: { isDeleted: { $ne: true } } 
            },
            {
                $lookup: { from: 'quotations', localField: 'quoteId', foreignField: '_id', as: 'quotation' }
            },
            {
                $lookup: { from: 'employees', localField: 'quotation.createdBy', foreignField: '_id', as: 'salesPersonDetails' }
            },
            {
                $match: accessFilter
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            {
                $project: { total: 1, _id: 0 }
            }
        ]).exec();

        if (jobTotal.length === 0) {
            jobTotal.push({ total: 0 });
        }

        if (jobTotal) return res.status(200).json(jobTotal[0])

        return res.status(502).json()
    } catch (error) {
        next(error);
    }
};




export const updateJobStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        const { jobId } = req.params;
        const jobUpdated = await jobModel.findByIdAndUpdate(jobId, { status: status })

        if (jobUpdated) {
            return res.status(200).json(status)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}


export const getJobSalesPerson = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const customers = await jobModel.aggregate([
            {
                $match: { isDeleted: { $ne: true } }
            },
            {
                $lookup: { from: 'quotations', localField: 'quoteId', foreignField: '_id', as: 'quotaion' }
            },
            {
                $unwind: "$quotaion"
            },
            {
                $group: {
                    _id: "$quotaion.createdBy",
                    count: { $sum: 1 }
                },
            },
            {
                $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'createdBy' }
            },
            {
                $unwind: "$createdBy"
            },
            {
                $project: {
                    _id: 0,
                    createdBy: 1
                }
            },
            {
                $project: {
                    _id: "$createdBy._id",
                    fullName: { $concat: ["$createdBy.firstName", " ", "$createdBy.lastName"] }
                }
            }
        ]);
        if (customers.length > 0) {
            return res.status(200).json(customers);
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobId = req.params.id;
        
        // Check if job exists and isn't already deleted
        const job = await jobModel.findOne({
            _id: jobId,
            isDeleted: { $ne: true }
        });

        if (!job) {
            return res.status(404).json({
                message: 'Job not found or already deleted'
            });
        }

        // Soft delete the job
        await jobModel.findByIdAndUpdate(jobId, {
            isDeleted: true
        });

        return res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}
