import { NextFunction, Request, Response } from "express"
import jobModel from "../models/job.model"
import Employee from '../models/employee.model';


const { ObjectId } = require('mongodb')

export const jobList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page, row, status, selectedMonth, selectedYear, access, userId } = req.body;
        let isStatus = status == null ? true : false;
        let skipNum: number = (page - 1) * row;

        let matchFilters: any = {
            $and: [
                { $or: [{ status: status }, { status: { $exists: isStatus } }] },
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

        const jobData = await jobModel.aggregate([
            {
                $match: matchFilters
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
                $lookup: { from: 'quotations', localField: 'quoteId', foreignField: '_id', as: 'quotation' }
            },
            {
                $lookup: { from: 'customers', localField: 'quotation.client', foreignField: '_id', as: 'clientDetails' }
            },
            {
                $lookup: { from: 'departments', localField: 'quotation.department', foreignField: '_id', as: 'departmentDetails' }
            },
            {
                $lookup: { from: 'employees', localField: 'quotation.createdBy', foreignField: '_id', as: 'salesPersonDetails' }
            },
            {
                $match: accessFilter
            },
        ]);

        const jobTotal: { total: number }[] = await jobModel.aggregate([
            
            {
                $lookup: { from: 'quotations', localField: 'quoteId', foreignField: '_id', as: 'quotation' }
            },
            {
                $lookup: { from: 'employees', localField: 'quotation.createdBy', foreignField: '_id', as: 'salesPersonDetails' }
            },
            {
                $match: matchFilters
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

        if (jobTotal.length) {
            return res.status(200).json({ total: jobTotal[0].total, job: jobData });
        } else {
            return res.status(504).json({ err: 'No job data found' });
        }
    } catch (error) {
        next(error);
    }
};

export const totalJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let {  access, userId } = req.query;

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

