import { NextFunction, Request, Response } from "express"
import enquiryModel from "../models/enquiry.model"
const { ObjectId } = require('mongodb')

export const createEnquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) return res.status(204).json({ err: 'No data' })
        const enquiryData = req.body
        enquiryData.date = new Date(enquiryData.date)
        const preSaleData = new enquiryModel(enquiryData)
        const savePreSaleData = await (await preSaleData.save()).populate(['client', 'department', 'salesPerson'])
        if (!savePreSaleData) return res.status(504).json({ err: 'Internal Error' })
        return res.status(200).json(preSaleData)
    } catch (error) {
        next(error)
    }
}

export const getEnquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page, row, salesPerson, status, fromDate, toDate } = req.body;
        let index: number = (page - 1) * row;
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
        }

        const enquiryTotal = await enquiryModel.aggregate([
            {
                $match: matchSalesPerson
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            {
                $project: { total: 1, _id: 0 }
            }
        ])


        const enquiryData = await enquiryModel.aggregate([
            {
                $match: matchSalesPerson
            },
            {
                $sort: { createdDate: -1 }
            },
            {
                $skip: index
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

        if (!enquiryData.length) return res.status(504).json({ err: 'No enquiry data found' })
        return res.status(200).json({ total: enquiryTotal[0].total, enquiry: enquiryData })
    } catch (error) {
        next(error)
    }
}

export const getPreSaleJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const preSaleData = await enquiryModel.find({ status: 'Assigned To Presales' })
            .populate(['client', 'department', 'salesPerson'])
        if (preSaleData) return res.status(200).json(preSaleData)
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const updateEnquiryStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let data = req.body
        const update = await enquiryModel.findOneAndUpdate({ _id: data.id }, { $set: { status: data.status } })
            .populate(['client', 'department', 'salesPerson'])
        if (update) return res.status(200).json(update)
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const totalEnquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await enquiryModel.aggregate([
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
        ])

        if (result) return res.status(200).json(result)
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const monthlyEnquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await enquiryModel.aggregate([
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
        ])

        if (result) return res.status(200).json(result)
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}