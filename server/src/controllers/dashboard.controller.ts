import { NextFunction, Request, Response } from "express"
import quotationModel from "../models/quotation.model";
import { ObjectId } from "mongodb"
import employeeModel from "../models/employee.model";
import jobModel from "../models/job.model";
import { buildDashboardFilters, calculateCostPricePipe, calculateDiscountPrice, calculateTotalCost, getUSDRated, lastSevenMonths, months, calculateDiscountPricePipe } from "../common/util";
import categoryModel, { Privileges } from "../models/category.model";
import { Filters } from "../interface/dashboard.interface";
import enquiryModel from "../models/enquiry.model";
import { totalEnquiries } from "./department.controller";
import { totalQuotation } from "./quotation.controller";


export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, filters } = req.body;
        if (userId) {
            const userCategory = (await employeeModel.findById(userId)).category;
            const privileges: Privileges = (await categoryModel.findById(userCategory)).privileges;

            const dashboardMetrics: { name: string; type: string; value: number; lastWeek: number, lastWeekName: string, rank: number }[] = [];

            const metricsMap = {
                revenue: {
                    privilege: privileges.jobSheet.viewReport,
                    method: getRevenueAchieved,
                    metrics: [
                        { name: 'Revenue Achieved', type: 'QAR', key: 'totalSellingPrice', lastKey: 'lastWeekSellingPrice', lastWeekName: 'revenue', rank: 1 },
                        { name: 'Gross Profit', type: 'QAR', key: 'grossProfit', lastKey: 'lastWeekgrossProfit', lastWeekName: 'profit', rank: 2 },
                        { name: 'Total Job Awarded', type: 'No.', key: 'totalJobAwarded', lastKey: 'lastWeekJobAwarded', lastWeekName: 'job awarded', rank: 6 },
                    ]
                },
                enquiry: {
                    privilege: privileges.enquiry.viewReport,
                    method: getEnquiriesCount,
                    metrics: [
                        { name: 'Total No. oF Enquiries', type: 'No.', key: 'totalEnquiries', lastKey: 'lastWeekEnquiries', lastWeekName: 'enquiries', rank: 3 },
                    ]
                },
                quotations: {
                    privilege: privileges.quotation.viewReport,
                    method: getQuotations,
                    metrics: [
                        { name: 'Total No. oF Quote Submitted', type: 'No.', key: 'totalQuotations', lastKey: 'lastWeekQuotations', lastWeekName: 'quoations', rank: 4 },
                        { name: 'Total Quote Value', type: 'QAR', key: 'totalQuoteValue', lastKey: 'lastWeekQuoteValue', lastWeekName: 'quote valued', rank: 5 },
                    ]
                },
                assignedJobs: {
                    privilege: privileges.assignedJob.viewReport,
                    method: getAssignedJobs,
                    metrics: [
                        { name: 'No. of Assigned Jobs', type: 'No.', key: 'totalAssignedJobs', lastKey: 'lastWeekAssignedJobs', lastWeekName: 'completed jobs', rank: 7 },
                        { name: 'Jobs Awarded from Assigned Jobs', type: 'No.', key: 'jobAwarded', lastKey: 'lastWeekJobAwarded', lastWeekName: 'jobs awarded', rank: 8 },
                        { name: 'Revenue from Assigned Jobs', type: 'QAR', key: 'revenue', lastKey: 'lastWeekRevenue', lastWeekName: 'revenue', rank: 9 },
                    ]
                },
            };

            const metricsPromises = Object.entries(metricsMap).map(async ([key, value]) => {
                if (value.privilege !== 'none') {
                    const revenueAchieved = await value.method(value.privilege, userId, filters);
                    return value.metrics.map(metric => ({
                        name: metric.name,
                        type: metric.type,
                        value: revenueAchieved ? revenueAchieved[metric.key] : 0,
                        lastWeek: revenueAchieved ? revenueAchieved[metric.lastKey] : 0,
                        rank: metric.rank,
                        lastWeekName: metric.lastWeekName,
                    }));
                }
                return [];
            });

            const results = await Promise.all(metricsPromises);

            results.forEach(metrics => dashboardMetrics.push(...metrics));

            return res.status(200).json(dashboardMetrics);
        }

    } catch (error) {
        next(error);
    }
}



const getRevenueAchieved = async (access: string, userId: string, filters: Filters) => {
    try {
        let accessFilter = {};

        let employeesReportingToUser = await employeeModel.find({ reportingTo: userId }, '_id');
        let reportedToUserIds = employeesReportingToUser.map(employee => employee._id);

        switch (access) {
            case 'created':
                accessFilter = { 'salesPerson._id': new ObjectId(userId) };
                break;
            case 'reported':
                accessFilter = { 'salesPerson._id': { $in: reportedToUserIds } };
                break;
            case 'createdAndReported':
                accessFilter = {
                    $or: [
                        { 'salesPerson._id': new ObjectId(userId) },
                        { 'salesPerson._id': { $in: reportedToUserIds } }
                    ]
                };
                break;

            default:
                break;
        }

        const USDRates = await getUSDRated();
        const qatarUsdRate = USDRates.usd.qar;

        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate);
        sevenDaysAgo.setDate(currentDate.getDate() - 7);

        const jobTotal = await jobModel.aggregate([
            {
                $lookup: { from: 'quotations', localField: 'quoteId', foreignField: '_id', as: 'quotation' }
            },
            {
                $unwind: "$quotation"
            },
            {
                $lookup: { from: 'employees', localField: 'quotation.createdBy', foreignField: '_id', as: 'salesPerson' }
            },
            {
                $lookup: { from: 'departments', localField: 'quotation.department', foreignField: '_id', as: 'department' }
            },
            {
                $unwind: "$salesPerson"
            },
            {
                $unwind: "$department"
            },
            {
                $match: { ...accessFilter, ...buildDashboardFilters(filters) }
            },
            {
                $addFields: {
                    totalSellingPrice: {
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
                    totalCostPrice:
                    {
                        $sum: {
                            $cond: [
                                { $eq: ['$quotation.currency', 'USD'] },
                                {
                                    $multiply: [
                                        calculateCostPricePipe('$quotation.dealData.updatedItems'),
                                        qatarUsdRate
                                    ]
                                },
                                calculateCostPricePipe('$quotation.dealData.updatedItems')
                            ]
                        }
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalSellingPrice: { $sum: '$totalSellingPrice' },
                    totalCostPrice: { $sum: '$totalCostPrice' },
                    lastWeekSellingPrice: {
                        $sum: {
                            '$cond': [
                                { $gte: ['$createdDate', sevenDaysAgo] },
                                '$totalSellingPrice',
                                0
                            ]
                        }
                    },
                    lastWeekCostPrice: {
                        $sum: {
                            '$cond': [
                                { $gte: ['$createdDate', sevenDaysAgo] },
                                '$totalCostPrice',
                                0
                            ]
                        }
                    },
                    totalJobAwarded: { $sum: 1 },
                    lastWeekJobAwarded: {
                        $sum: {
                            '$cond': [
                                { $gte: ['$createdDate', sevenDaysAgo] },
                                1,
                                0
                            ]
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSellingPrice: 1,
                    lastWeekSellingPrice: 1,
                    grossProfit: { $subtract: ['$totalSellingPrice', '$totalCostPrice'] },
                    lastWeekgrossProfit: { $subtract: ['$lastWeekSellingPrice', '$lastWeekCostPrice'] },
                    totalJobAwarded: 1,
                    lastWeekJobAwarded: 1,
                }
            },
        ]).exec();


        return jobTotal[0];
    } catch (error) {
        console.error(error);
    }
}

const getEnquiriesCount = async (access: string, userId: string, filters: Filters) => {
    try {

        let accessFilter = {};

        let employeesReportingToUser = await employeeModel.find({ reportingTo: userId }, '_id');
        let reportedToUserIds = employeesReportingToUser.map(employee => employee._id);

        switch (access) {
            case 'created':
                accessFilter = { 'salesPerson._id': new ObjectId(userId) };
                break;
            case 'reported':
                accessFilter = { 'salesPerson._id': { $in: reportedToUserIds } };
                break;
            case 'createdAndReported':
                accessFilter = {
                    $or: [
                        { 'salesPerson._id': new ObjectId(userId) },
                        { 'salesPerson._id': { $in: reportedToUserIds } }
                    ]
                };
                break;

            default:
                break;
        }

        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate);
        sevenDaysAgo.setDate(currentDate.getDate() - 7);

        const enqTotal = await enquiryModel.aggregate([
            { $match: { status: { $ne: 'Quoted' } } },
            {
                $unset: "createdDate"
            },
            {
                $addFields: {
                    createdDate: { $toDate: "$preSale.createdDate" }
                }
            },
            {
                $lookup: { from: 'employees', localField: 'salesPerson', foreignField: '_id', as: 'salesPerson' }
            },
            {
                $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
            },
            {
                $unwind: "$salesPerson"
            },
            {
                $unwind: "$department"
            },
            {
                $match: { ...accessFilter, ...buildDashboardFilters(filters) }
            },
            {
                $group: {
                    _id: null,
                    totalEnquiries: { $sum: 1 },
                lastWeekEnquiries: {
                        $sum: {
                            '$cond': [
                                { $gte: ['$createdDate', sevenDaysAgo] },
                                1,
                                0
                            ]
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalEnquiries: 1,
                    lastWeekEnquiries: 1
                }
            }
        ]).exec();

        

        return enqTotal[0];
    } catch (error) {
        console.error(error);
    }
}

const getQuotations = async (access: string, userId: string, filters: Filters) => {
    try {
        let accessFilter = {};

        let employeesReportingToUser = await employeeModel.find({ reportingTo: userId }, '_id');
        let reportedToUserIds = employeesReportingToUser.map(employee => employee._id);

        switch (access) {
            case 'created':
                accessFilter = { createdBy: new ObjectId(userId) };
                break;
            case 'reported':
                accessFilter = { createdBy: { $in: reportedToUserIds } };
                break;
            case 'createdAndReported':
                accessFilter = {
                    $or: [
                        { createdBy: new ObjectId(userId) },
                        { createdBy: { $in: reportedToUserIds } }
                    ]
                };
                break;

            default:
                break;
        }

        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate);
        sevenDaysAgo.setDate(currentDate.getDate() - 7);

        const USDRates = await getUSDRated();
        const qatarUsdRate = USDRates.usd.qar;

        const quoteTotal = await quotationModel.aggregate([
            {
                $addFields: {
                    createdDate: "$date"
                }
            },
            {
                $lookup: { from: 'employees', localField: 'createdBy', foreignField: '_id', as: 'salesPerson' }
            },
            {
                $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
            },
            {
                $unwind: "$salesPerson"
            },
            {
                $unwind: "$department"
            },
            {
                $match: { ...accessFilter, ...buildDashboardFilters(filters) }
            },
            {
                $addFields: {
                    totalSellingPrice: {
                        $sum: {
                            $cond: [
                                { $eq: ['$currency', 'USD'] },
                                {
                                    $multiply: [
                                        calculateDiscountPricePipe('$items', '$totalDiscount'),
                                        qatarUsdRate
                                    ]
                                },
                                calculateDiscountPricePipe('$items', '$totalDiscount')
                            ]
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    totalQuotations: { $sum: 1 },
                    lastWeekQuotations: {
                        $sum: {
                            '$cond': [
                                { $gte: ['$createdDate', sevenDaysAgo] },
                                1,
                                0
                            ]
                        }
                    },
                    totalQuoteValue: { $sum: '$totalSellingPrice' },
                    lastWeekQuoteValue: {
                        $sum: {
                            '$cond': [
                                { $gte: ['$createdDate', sevenDaysAgo] },
                                '$totalSellingPrice',
                                0
                            ]
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalQuotations: 1,
                    lastWeekQuotations: 1,
                    totalQuoteValue: 1,
                    lastWeekQuoteValue: 1
                }
            }
        ]).exec();

        return quoteTotal[0];
    } catch (error) {
        console.error(error);
    }
}


const getAssignedJobs = async (access: string, userId: string, filters: Filters) => {
    try {
        let accessFilter: any = {};
        switch (access) {
            case 'assigned':
                accessFilter['preSale.presalePerson'] = new ObjectId(userId);
                break;
            default:
                break;
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const assignedJobCount = await enquiryModel.aggregate([
            {
                $unset: "createdDate"
            },
            {
                $addFields: {
                    createdDate: { $toDate: "$preSale.createdDate" }
                }
            },
            {
                $lookup: { from: 'employees', localField: 'preSale.presalePerson', foreignField: '_id', as: 'salesPerson' }
            },
            {
                $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
            },
            {
                $unwind: "$salesPerson"
            },
            {
                $unwind: "$department"
            },
            {
                $match: { ...accessFilter, ...buildDashboardFilters(filters) }
            },
            {
                $facet: {
                    totalCount: [
                        {
                            $match: {
                                status: 'Assigned To Presales'
                            }
                        },
                        { $count: "total" }
                    ],
                    lastWeekCount: [
                        {
                            $match: {
                                createdDate: { $gte: oneWeekAgo },
                                status: 'Work In Progress'
                            }
                        },
                        { $count: "lastWeek" }
                    ]
                }
            },
            {
                $project: {
                    totalAssignedJobs: { $ifNull: [{ $arrayElemAt: ["$totalCount.total", 0] }, 0] },
                    lastWeekAssignedJobs: { $ifNull: [{ $arrayElemAt: ["$lastWeekCount.lastWeek", 0] }, 0] }
                }
            }
        ]).exec();



        let accessFilterForAwarded: any = { 'enquiry.status': 'Quoted' };
        switch (access) {
            case 'assigned':
                accessFilter['enquiry.preSale.presalePerson'] = new ObjectId(userId);
                break;
            default:
                break;
        }


        const USDRates = await getUSDRated();
        const qatarUsdRate = USDRates.usd.qar;


        const assignedJobAwarded = await jobModel.aggregate([
            {
                $lookup: { from: 'quotations', localField: 'quoteId', foreignField: '_id', as: 'quotation' }
            },
            {
                $unwind: "$quotation"
            },
            {
                $lookup: { from: 'enquiries', localField: 'quotation.enqId', foreignField: '_id', as: 'enquiry' }
            },
            {
                $unwind: "$enquiry"
            },
            {
                $lookup: { from: 'employees', localField: 'enquiry.preSale.presalePerson', foreignField: '_id', as: 'salesPerson' }
            },
            {
                $lookup: { from: 'departments', localField: 'enquiry.department', foreignField: '_id', as: 'department' }
            },
            {
                $unwind: "$salesPerson"
            },
            {
                $unwind: "$department"
            },
            {
                $match: { ...accessFilterForAwarded, ...buildDashboardFilters(filters) }
            },
            {
                $addFields: {
                    totalSellingPrice: {
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
                }
            },
            {
                $group: {
                    _id: null,
                    jobAwarded: { $sum: 1 },
                    lastWeekJobAwarded: {
                        $sum: {
                            '$cond': [
                                { $gte: ['$createdDate', oneWeekAgo] },
                                1,
                                0
                            ]
                        }
                    },
                    revenue: { $sum: '$totalSellingPrice' },
                    lastWeekRevenue: {
                        $sum: {
                            '$cond': [
                                { $gte: ['$createdDate', oneWeekAgo] },
                                '$totalSellingPrice',
                                0
                            ]
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    jobAwarded: 1,
                    lastWeekJobAwarded: 1,
                    revenue: 1,
                    lastWeekRevenue: 1
                }
            }
        ]).exec();

        const assignedJobs = assignedJobCount.length ? assignedJobCount[0] : { totalAssignedJobs: 0, lastWeekAssignedJobs: 0 };
        const awardedJobs = assignedJobAwarded.length ? assignedJobAwarded[0] : { jobAwarded: 0, lastWeekJobAwarded: 0, revenue: 0, lastWeekRevenue: 0 };

        return {
            ...assignedJobs,
            ...awardedJobs
        };


    } catch (error) {
        console.error(error);
    }
}


export const getRevenuePerSalesperson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, filters } = req.body;
        if (userId) {
            const userCategory = (await employeeModel.findById(userId)).category;
            const privileges: Privileges = (await categoryModel.findById(userCategory)).privileges;

            let accessFilter = {};

            let employeesReportingToUser = await employeeModel.find({ reportingTo: userId }, '_id');
            let reportedToUserIds = employeesReportingToUser.map(employee => employee._id);

            switch (privileges.employee.viewReport) {
                case 'created':
                    accessFilter = { 'salesPerson._id': new ObjectId(userId) };
                    break;
                case 'reported':
                    accessFilter = { 'salesPerson._id': { $in: reportedToUserIds } };
                    break;
                case 'createdAndReported':
                    accessFilter = {
                        $or: [
                            { 'salesPerson._id': new ObjectId(userId) },
                            { 'salesPerson._id': { $in: reportedToUserIds } }
                        ]
                    };
                    break;

                default:
                    break;
            }

            const USDRates = await getUSDRated();
            const qatarUsdRates = USDRates.usd.qar;


            const jobTotal = await jobModel.aggregate([
                {
                    $lookup: { from: 'quotations', localField: 'quoteId', foreignField: '_id', as: 'quotation' }
                },
                {
                    $unwind: '$quotation'
                },
                {
                    $lookup: { from: 'employees', localField: 'quotation.createdBy', foreignField: '_id', as: 'salesPerson' }
                },
                {
                    $lookup: { from: 'departments', localField: 'quotation.department', foreignField: '_id', as: 'department' }
                },
                {
                    $unwind: "$salesPerson"
                },
                {
                    $unwind: "$department"
                },
                {
                    $match: { ...accessFilter, ...buildDashboardFilters(filters) }
                },
                {
                    $group: {
                        _id: '$quotation.createdBy',
                        totalRevenue: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$quotation.currency', 'USD'] },
                                    {
                                        $multiply: [
                                            calculateDiscountPricePipe('$quotation.dealData.updatedItems', '$quotation.totalDiscount'),
                                            qatarUsdRates
                                        ]
                                    },
                                    calculateDiscountPricePipe('$quotation.dealData.updatedItems', '$quotation.totalDiscount')
                                ]
                            }
                        },
                        firstName: { $first: '$salesPerson.firstName' },
                        lastName: { $first: '$salesPerson.lastName' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        salesPersonId: '$_id',
                        salesPerson: { $concat: ['$firstName', ' ', '$lastName'] },
                        totalRevenue: '$totalRevenue'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: '$salesPerson',
                        value: {
                            $substr: [
                                { $toString: { $round: ['$totalRevenue', 2] } },
                                0,
                                -1
                            ]
                        }
                    }
                },
            ]).exec();

            return res.status(200).json(jobTotal);
        }

    } catch (error) {
        next(error);
    }
}


export const getGrossProfitForLastSevenMonths = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, filters } = req.body;
        if (userId) {
            const userCategory = (await employeeModel.findById(userId)).category;
            const privileges: Privileges = (await categoryModel.findById(userCategory)).privileges;


            let accessFilter = {};

            let employeesReportingToUser = await employeeModel.find({ reportingTo: userId }, '_id');
            let reportedToUserIds = employeesReportingToUser.map(employee => employee._id);

            switch (privileges.jobSheet.viewReport) {
                case 'created':
                    accessFilter = { 'salesPerson._id': new ObjectId(userId) };
                    break;
                case 'reported':
                    accessFilter = { 'salesPerson._id': { $in: reportedToUserIds } };
                    break;
                case 'createdAndReported':
                    accessFilter = {
                        $or: [
                            { 'salesPerson._id': new ObjectId(userId) },
                            { 'salesPerson._id': { $in: reportedToUserIds } }
                        ]
                    };
                    break;
    
                default:
                    break;
            }

            const currentDate = new Date();
            const sevenMonthsAgo = new Date(currentDate);
            sevenMonthsAgo.setMonth(currentDate.getMonth() - 6);

            // Fetch the USD to QAR exchange rate
            const USDRates = await getUSDRated(); // Example API or function for fetching exchange rates
            const qatarUsdRate = USDRates.usd.qar;

            const jobGrossProfit = await jobModel.aggregate([
                {
                    $lookup: {
                        from: 'quotations',
                        localField: 'quoteId',
                        foreignField: '_id',
                        as: 'quotation'
                    }
                },
                {
                    $unwind: '$quotation'
                },
                {
                    $lookup: {
                        from: 'employees',
                        localField: 'quotation.createdBy',
                        foreignField: '_id',
                        as: 'salesPerson'
                    }
                },
                {
                    $lookup: {
                        from: 'departments',
                        localField: 'quotation.department',
                        foreignField: '_id',
                        as: 'department'
                    }
                },
                {
                    $unwind: "$salesPerson"
                },
                {
                    $unwind: "$department"
                },
                {
                    $match: {
                        ...accessFilter,
                        ...buildDashboardFilters(filters),
                        createdDate: { $gte: sevenMonthsAgo }
                    }
                },
                {
                    $addFields: {
                        totalSellingPrice: {
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
                        totalCostPrice:
                        {
                            $sum: {
                                $cond: [
                                    { $eq: ['$quotation.currency', 'USD'] },
                                    {
                                        $multiply: [
                                            calculateCostPricePipe('$quotation.dealData.updatedItems'),
                                            qatarUsdRate
                                        ]
                                    },
                                    calculateCostPricePipe('$quotation.dealData.updatedItems')
                                ]
                            }
                        },
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdDate' },
                            month: { $month: '$createdDate' }
                        },
                        totalSellingPrice: { $sum: '$totalSellingPrice' },
                        totalCost: { $sum: '$totalCostPrice' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        month: { $arrayElemAt: [months, { $subtract: ['$_id.month', 1] }] },
                        grossProfit: { $subtract: ['$totalSellingPrice', '$totalCost'] }
                    }
                },
                {
                    $project: {
                        month: '$month.name', // Accessing only the name property
                        grossProfit: 1 // Keep the grossProfit field
                    }
                },
                {
                    $sort: { month: 1 }
                }
            ]);

            const completeData = lastSevenMonths.map(month => {
                const found = jobGrossProfit.find(data => data.month === month.name);
                return {
                    month: month.name,
                    grossProfit: found ? found.grossProfit : 0
                };
            });

            const monthArray = completeData.map(data => data.month);
            const profitArray = completeData.map(data => data.grossProfit);

            return res.status(200).json({ months: monthArray, profits: profitArray });
        }

    } catch (error) {
        next(error);
    }
}

export const getEnquirySalesConversion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, filters } = req.body;
        if (userId) {
            const userCategory = (await employeeModel.findById(userId)).category;
            const privileges: Privileges = (await categoryModel.findById(userCategory)).privileges;


            let accessFilter = {};

            let employeesReportingToUser = await employeeModel.find({ reportingTo: userId }, '_id');
            let reportedToUserIds = employeesReportingToUser.map(employee => employee._id);

            switch (privileges.enquiry.viewReport) {
                case 'created':
                    accessFilter = { salesPerson: new ObjectId(userId) };
                    break;
                case 'reported':
                    accessFilter = { salesPerson: { $in: reportedToUserIds } };
                    break;
                case 'createdAndReported':
                    accessFilter = {
                        $or: [
                            { salesPerson: new ObjectId(userId) },
                            { salesPerson: { $in: reportedToUserIds } }
                        ]
                    };
                    break;

                default:
                    break;
            }

            const enqTotal = await enquiryModel.aggregate([
                {
                    $unset: "createdDate"
                },
                {
                    $addFields: {
                        createdDate: { $toDate: "$preSale.createdDate" }
                    }
                },
                {
                    $lookup: { from: 'employees', localField: 'salesPerson', foreignField: '_id', as: 'salesPerson' }
                },
                {
                    $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
                },
                {
                    $unwind: "$salesPerson"
                },
                {
                    $unwind: "$department"
                },
                {
                    $match: { ...accessFilter, ...buildDashboardFilters(filters) }
                }
            ]).exec();

            const enquiriesWithJobs = await enquiryModel.aggregate([
                {
                    $unset: "createdDate"
                },
                {
                    $addFields: {
                        createdDate: { $toDate: "$preSale.createdDate" }
                    }
                },
                {
                    $lookup: { from: 'employees', localField: 'salesPerson', foreignField: '_id', as: 'salesPerson' }
                },
                {
                    $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
                },
                {
                    $unwind: "$salesPerson"
                },
                {
                    $unwind: "$department"
                },
                {
                    $match: { ...accessFilter, ...buildDashboardFilters(filters) }
                },
                {
                    $lookup: {
                        from: 'quotations',
                        localField: '_id',
                        foreignField: 'enqId',
                        as: 'quotation'
                    }
                },
                {
                    $unwind: '$quotation'
                },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'quotation._id',
                        foreignField: 'quoteId',
                        as: 'job'
                    }
                },
                {
                    $match: {
                        'job': { $ne: [] }
                    }
                }
            ]);

            return res.status(200).json({ total: enqTotal.length, converted: enquiriesWithJobs.length })
        }

    } catch (error) {
        next(error);
    }
}

export const getPresaleJobSalesConversion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, filters } = req.body;
        if (userId) {
            const userCategory = (await employeeModel.findById(userId)).category;
            const privileges: Privileges = (await categoryModel.findById(userCategory)).privileges;


            let accessFilter = {};

            switch (privileges.assignedJob.viewReport) {
                case 'assigned':
                    accessFilter['preSale.presalePerson'] = new ObjectId(userId);
                    break;
                default:
                    break;
            }

            const enqTotal = await enquiryModel.aggregate([
                {
                    $match: {
                        "preSale.presalePerson": { $exists: true, $ne: null }
                    }
                },
                {
                    $unset: "createdDate"
                },
                {
                    $addFields: {
                        createdDate: { $toDate: "$preSale.createdDate" }
                    }
                },
                {
                    $lookup: { from: 'employees', localField: 'salesPerson', foreignField: '_id', as: 'salesPerson' }
                },
                {
                    $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
                },
                {
                    $unwind: "$salesPerson"
                },
                {
                    $unwind: "$department"
                },
                {
                    $match: { ...accessFilter, ...buildDashboardFilters(filters) }
                }
            ]).exec();

            const enquiriesWithJobs = await enquiryModel.aggregate([
                {
                    $match: {
                        "preSale.presalePerson": { $exists: true, $ne: null }
                    }
                },
                {
                    $unset: "createdDate"
                },
                {
                    $addFields: {
                        createdDate: { $toDate: "$preSale.createdDate" }
                    }
                },
                {
                    $lookup: { from: 'employees', localField: 'salesPerson', foreignField: '_id', as: 'salesPerson' }
                },
                {
                    $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
                },
                {
                    $unwind: "$salesPerson"
                },
                {
                    $unwind: "$department"
                },
                {
                    $match: { ...accessFilter, ...buildDashboardFilters(filters) }
                },
                {
                    $lookup: {
                        from: 'quotations',
                        localField: '_id',
                        foreignField: 'enqId',
                        as: 'quotation'
                    }
                },
                {
                    $unwind: '$quotation'
                },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'quotation._id',
                        foreignField: 'quoteId',
                        as: 'job'
                    }
                },
                {
                    $match: {
                        'job': { $ne: [] }
                    }
                },
            ]);

            return res.status(200).json({ total: enqTotal.length, converted: enquiriesWithJobs.length })
        }

    } catch (error) {
        next(error);
    }
}
