import { NextFunction, Request, Response } from "express"
import quotationModel from "../models/quotation.model";
import { ObjectId } from "mongodb"
import employeeModel from "../models/employee.model";
import jobModel from "../models/job.model";
import { buildDashboardFilters, calculateDiscountPrice, calculateTotalCost, getUSDRated } from "../common/util";
import categoryModel, { Privileges } from "../models/category.model";
import { Filters } from "../interface/dashboard.interface";
import enquiryModel from "../models/enquiry.model";


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

            for (const [key, value] of Object.entries(metricsMap)) {
                if (value.privilege !== 'none') {
                    const revenueAchieved = await value.method(value.privilege, userId, filters);
                    value.metrics.forEach(metric => {
                        dashboardMetrics.push({
                            name: metric.name,
                            type: metric.type,
                            value: revenueAchieved[metric.key],
                            lastWeek: revenueAchieved[metric.lastKey],
                            rank: metric.rank,
                            lastWeekName: metric.lastWeekName,
                        });
                    });
                }
            }

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

        const jobTotal = await jobModel.aggregate([
            {
                $lookup: { from: 'quotations', localField: 'quoteId', foreignField: '_id', as: 'quotation' }
            },
            {
                $lookup: { from: 'employees', localField: 'quotation.createdBy', foreignField: '_id', as: 'salesPerson' }
            },
            {
                $lookup: { from: 'departments', localField: 'quotation.department', foreignField: '_id', as: 'department' }
            },
            {
                $match: { ...accessFilter, ...buildDashboardFilters(filters) }
            }
        ]).exec();


        if (!jobTotal || jobTotal.length === 0) {
            return { totalSellingPrice: 0, lastWeekSellingPrice: 0, grossProfit: 0, lastWeekgrossProfit: 0, totalJobAwarded: 0, lastWeekJobAwarded: 0 };
        }
        let lastWeekJobAwarded = 0
        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate);
        sevenDaysAgo.setDate(currentDate.getDate() - 7);

        const totalValues = jobTotal.reduce((acc, job) => {
            const quote = job?.quotation[0];
            const updatedItems = quote?.dealData?.updatedItems || [];
            const totalSellingPrice = calculateDiscountPrice(quote, updatedItems);
            const totalCost = calculateTotalCost(quote, updatedItems);

            if (quote.currency === 'USD') {
                acc.totalSellingUSDPrice += totalSellingPrice;
                acc.totalCostUSDPrice += totalCost;
                if (job.createdDate > sevenDaysAgo) {
                    acc.lastWeekSellingUSDPrice += totalSellingPrice;
                    acc.lastWeekCostUSDPrice += totalCost;
                    lastWeekJobAwarded += 1;
                }
            } else {
                acc.totalSellingQARPrice += totalSellingPrice;
                acc.totalCostQARPrice += totalCost;

                if (job.createdDate > sevenDaysAgo) {
                    acc.lastWeekSellingQARPrice += totalSellingPrice;
                    acc.lastWeekCostQARPrice += totalCost;
                    lastWeekJobAwarded += 1;
                }
            }
            return acc;
        }, {
            totalSellingUSDPrice: 0,
            totalSellingQARPrice: 0,
            totalCostUSDPrice: 0,
            totalCostQARPrice: 0,
            lastWeekSellingUSDPrice: 0,
            lastWeekSellingQARPrice: 0,
            lastWeekCostUSDPrice: 0,
            lastWeekCostQARPrice: 0,
        });

        const USDRates = await getUSDRated();
        const qatarUsdRates = USDRates.usd.qar;
        const totalSellingPrice = totalValues.totalSellingQARPrice + (totalValues.totalSellingUSDPrice * qatarUsdRates);
        const totalCostPrice = totalValues.totalCostQARPrice + (totalValues.totalCostUSDPrice * qatarUsdRates);
        const grossProfit = totalSellingPrice - totalCostPrice;

        const lastWeekSellingPrice = totalValues.lastWeekSellingQARPrice + (totalValues.lastWeekSellingUSDPrice * qatarUsdRates);
        const lastWeekCostPrice = totalValues.lastWeekCostQARPrice + (totalValues.lastWeekCostUSDPrice * qatarUsdRates);
        const lastWeekgrossProfit = lastWeekSellingPrice - lastWeekCostPrice;

        return { totalSellingPrice, lastWeekSellingPrice, grossProfit, lastWeekgrossProfit, totalJobAwarded: jobTotal.length, lastWeekJobAwarded };
    } catch (error) {
        console.error(error);
        return { totalSellingPrice: 0, lastWeekSellingPrice: 0, grossProfit: 0, lastWeekgrossProfit: 0, totalJobAwarded: 0, lastWeekJobAwarded: 0 };
    }
}

const getEnquiriesCount = async (access: string, userId: string, filters: Filters) => {
    try {

        let accessFilter = {};

        let employeesReportingToUser = await employeeModel.find({ reportingTo: userId }, '_id');
        let reportedToUserIds = employeesReportingToUser.map(employee => employee._id);

        switch (access) {
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
                $addFields: {
                    createdDate: { $cond: [{ $ifNull: ["$createdDate", false] }, "$createdDate", "$date"] }
                }
            },
            {
                $lookup: { from: 'employees', localField: 'salesPerson', foreignField: '_id', as: 'salesPerson' }
            },
            {
                $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
            },
            {
                $match: { ...accessFilter, ...buildDashboardFilters(filters) }
            }
        ]).exec();

        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate);
        sevenDaysAgo.setDate(currentDate.getDate() - 7);

        const lastWeekEnquiries = enqTotal.reduce((acc, enq) => {
            if (enq.date > sevenDaysAgo) {
                acc += 1
            }
            return acc;
        }, 0);


        return { totalEnquiries: enqTotal.length, lastWeekEnquiries };
    } catch (error) {
        console.error(error);
        return { totalEnquiries: 0, lastWeekJobAwarded: 0 };
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
                $match: { ...accessFilter, ...buildDashboardFilters(filters) }
            }
        ]).exec();

        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate);
        sevenDaysAgo.setDate(currentDate.getDate() - 7);

        const USDRates = await getUSDRated();
        const qatarUsdRates = USDRates.usd.qar;

        const totalValues = quoteTotal.reduce((acc: any, quote: any) => {
            if (quote?.dealData?.status !== 'approved') {
                acc.totalQuotations += 1;
                if (quote.date > sevenDaysAgo) {
                    acc.lastWeekQuotations += 1
                }
            }
            const quoteValue = (quote.currency === 'USD')
                ? calculateDiscountPrice(quote, quote.items) * qatarUsdRates
                : calculateDiscountPrice(quote, quote.items);

            acc.totalQuoteValue += quoteValue;

            if (quote.date > sevenDaysAgo) {
                acc.lastWeekQuoteValue += quoteValue;
            }

            return acc;
        }, {
            totalQuotations: 0,
            lastWeekQuotations: 0,
            totalQuoteValue: 0,
            lastWeekQuoteValue: 0
        });

        return {
            totalQuotations: totalValues.totalQuotations,
            lastWeekQuotations: totalValues.lastWeekQuotations,
            totalQuoteValue: totalValues.totalQuoteValue,
            lastWeekQuoteValue: totalValues.lastWeekQuoteValue,
        };
    } catch (error) {
        console.error(error);
        return { totalQuotations: 0, lastWeekQuotations: 0, totalQuoteValue: 0, lastWeekQuoteValue: 0 };
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
                        { $count: "total" }],
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
                    totalCount: { $arrayElemAt: ["$totalCount.total", 0] },
                    lastWeekCount: { $arrayElemAt: ["$lastWeekCount.lastWeek", 0] }
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
                $match: { ...accessFilterForAwarded, ...buildDashboardFilters(filters) }
            }
        ]).exec();


        const USDRates = await getUSDRated();
        const qatarUsdRates = USDRates.usd.qar;

        const totalValues = assignedJobAwarded.reduce((acc: any, job: any) => {
            const quote = job?.quotation;
            const updatedItems = quote?.dealData?.updatedItems || [];
            const revenue = (quote.currency === 'USD')
                ? calculateDiscountPrice(quote, updatedItems) * qatarUsdRates
                : calculateDiscountPrice(quote, updatedItems);

            acc.revenue += revenue;
            acc.jobAwarded += 1;

            if (job.createdDate > oneWeekAgo) {
                acc.lastWeekRevenue += revenue;
                acc.lastWeekJobAwarded += 1;
            }

            return acc;
        }, {
            jobAwarded: 0,
            lastWeekJobAwarded: 0,
            revenue: 0,
            lastWeekRevenue: 0
        });

        return {
            totalAssignedJobs: assignedJobCount[0].totalCount || 0,
            lastWeekAssignedJobs: assignedJobCount[0].lastWeekCount || 0,
            jobAwarded: totalValues.jobAwarded || 0,
            lastWeekJobAwarded: totalValues.lastWeekJobAwarded || 0,
            revenue: totalValues.revenue || 0,
            lastWeekRevenue: totalValues.lastWeekRevenue || 0
        };
    } catch (error) {
        console.error(error);
        return { totalAssignedJobs: 0, lastWeekAssignedJobs: 0, totalQuoteValue: 0, lastWeekQuoteValue: 0 };
    }
}
