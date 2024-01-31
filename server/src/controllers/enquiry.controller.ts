import { NextFunction, Request, Response } from "express"
import enquiryModel from "../models/enquiry.model"
import { Enquiry } from "../interface/enquiry.interface"
const { ObjectId } = require('mongodb')

export const createEnquiry = async (req: any, res: Response, next: NextFunction) => {
    try {
<<<<<<< HEAD

        console.log(req.files);
        

=======
>>>>>>> 74f4e88c9c6dd1c359eaee267ab18050f85d978c
        if (!req.files) return res.status(204).json({ err: 'No data' })
        const enquiryFiles = req.files.attachments
        const presaleFiles = req.files.presaleFiles
        const enquiryData = <Enquiry>JSON.parse(req.body.enquiryData)
        enquiryData.attachments = []
        if (enquiryFiles) {
            enquiryData.attachments = enquiryFiles
        }

        const presalePerson = JSON.parse(req.body.presalePerson)
        if (presalePerson) {
            enquiryData.preSale = { presalePerson: presalePerson, presaleFiles: [] }
            if (presaleFiles) {
                enquiryData.preSale.presaleFiles = presaleFiles
            }
        }

        enquiryData.date = new Date(enquiryData.date)
<<<<<<< HEAD
        const preSaleData = new enquiryModel(enquiryData)
=======
        const newEnquiry = new enquiryModel(enquiryData)
>>>>>>> 74f4e88c9c6dd1c359eaee267ab18050f85d978c

        const saveEnquiryData = await (await newEnquiry.save()).populate(['client', 'department', 'salesPerson'])
        if (!saveEnquiryData) return res.status(504).json({ err: 'Internal Error' })
        return res.status(200).json(newEnquiry)
    } catch (error) {
        next(error)
    }
}

export const getEnquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page, row, salesPerson, status, fromDate, toDate, department } = req.body;
        let skipNum: number = (page - 1) * row;
        let isSalesPerson = salesPerson == null ? true : false;
        let isStatus = status == null ? true : false;
        let isDate = fromDate == null || toDate == null ? true : false;
        let isDepartment = department == null ? true : false;

        let matchFilters = {
            $and: [
                { $or: [{ salesPerson: new ObjectId(salesPerson) }, { salesPerson: { $exists: isSalesPerson } }] },
                { $or: [{ status: status }, { status: { $exists: isStatus } }] },
                {
                    $or: [
                        { $and: [{ date: { $gte: new Date(fromDate) } }, { date: { $lte: new Date(toDate) } }] },
                        { date: { $exists: isDate } }
                    ]
                },
                {
                    $or: [{ department: new ObjectId(department) }, { department: { $exists: isDepartment } }]
                }
            ]
        }

        const enquiryTotal: { total: number }[] = await enquiryModel.aggregate([
            {
                $match: matchFilters
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            {
                $project: { total: 1, _id: 0 }
            }
        ]).exec()

        const enquiryData = await enquiryModel.aggregate([
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
                $lookup: { from: 'customers', localField: 'client', foreignField: '_id', as: 'client' }
            },
            {
                $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
            },
            {
                $lookup: { from: 'employees', localField: 'salesPerson', foreignField: '_id', as: 'salesPerson' }
            },
        ]);

        if (enquiryTotal.length) return res.status(200).json({ total: enquiryTotal[0].total, enquiry: enquiryData })
        return res.status(504).json({ err: 'No enquiry data found' })

    } catch (error) {
        next(error)
    }
}

export const getPreSaleJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let page = Number(req.query.page)
        let row = Number(req.query.row)
        let skipNum: number = (page - 1) * row;

        const totalPresale: { total: number }[] = await enquiryModel.aggregate([
            {
                $match: { status: 'Assigned To Presales' }
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            { $project: { _id: 0, total: 1 } }
        ])

        const preSaleData = await enquiryModel.aggregate([
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
        ])
        if (totalPresale.length) return res.status(200).json({ total: totalPresale[0].total, enquiry: preSaleData })
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

export const uploadAssignFiles = async (req: any, res: Response, next: NextFunction) => {
    try {
        let files = req.files
        let enquiryId = req.body.enquiryId
        let uploadData = files
        const enquiryData = await enquiryModel.findOneAndUpdate({ _id: enquiryId }, { $set: { assignedFiles: uploadData } }, { upsert: true })
            .populate(['client', 'department', 'salesPerson'])
        enquiryData.assignedFiles = uploadData
        if (!enquiryData) return res.status(502).json()
        return res.status(200).json(enquiryData)
    } catch (error) {
        next(error)
    }
}