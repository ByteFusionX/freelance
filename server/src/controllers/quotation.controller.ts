import { NextFunction, Response, Request } from "express";
import Quotation from '../models/quotation.model';
import Job from '../models/job.model';
import Department from '../models/department.model';
import Employee from '../models/employee.model'
import Enquiry from "../models/enquiry.model";
import { getPreSaleJobs } from "./enquiry.controller";
const { ObjectId } = require('mongodb')



export const saveQuotation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quoteData = req.body;
        let quoteId: string = await generateQuoteId(quoteData.department, quoteData.createdBy, quoteData.date);
        quoteData.quoteId = quoteId;

        const quote = new Quotation(quoteData)

        const saveQuote = await (await quote.save()).populate('department')

        if (quoteData.enqId) {
            await Enquiry.findByIdAndUpdate(quoteData.enqId, { status: 'Quoted' })
        }

        if (saveQuote) {
            return res.status(200).json(saveQuote)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}


export const getQuotations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page, row, salesPerson, customer, fromDate, toDate, department, access, userId } = req.body;
        let skipNum: number = (page - 1) * row;
        let isSalesPerson = salesPerson == null ? true : false;
        let isCustomer = customer == null ? true : false;
        let isDate = fromDate == null || toDate == null ? true : false;
        let isDepartment = department == null ? true : false;

        let matchFilters = {
            $and: [
                { $or: [{ createdBy: new ObjectId(salesPerson) }, { createdBy: { $exists: isSalesPerson } }] },
                { $or: [{ client: new ObjectId(customer) }, { client: { $exists: isCustomer } }] },
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

        let accessFilter = {};

        let employeesReportingToUser = await Employee.find({ reportingTo: userId }, '_id');
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

        const filters = { $and: [matchFilters, accessFilter] }

        let total: number = 0;
        await Quotation.aggregate([
            {
                $match: filters
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            {
                $project: { total: 1, _id: 0 }
            }
        ]).exec()
            .then((result: { total: number }[]) => {
                if (result && result.length > 0) {
                    total = result[0].total
                }
            })

        let quoteData = await Quotation.aggregate([
            {
                $match: filters,
            },
            {
                $sort: { createdDate: 1 }
            },
            {
                $skip: skipNum
            },
            {
                $limit: row
            },
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
                $lookup: {
                    from: 'enquiries',
                    localField: 'enqId',
                    foreignField: '_id',
                    as: 'enqId'
                }
            },
            {
                $unwind: {
                    path: '$enqId',
                    preserveNullAndEmptyArrays: true
                }
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

        if (!quoteData || !total) return res.status(204).json({ err: 'No Quoatation data found' })
        return res.status(200).json({ total: total, quotations: quoteData })

    } catch (error) {
        console.log(error)
    }
}

export const getDealSheet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page, row, access, userId } = req.body;
        let skipNum: number = (page - 1) * row;

        let matchFilters = { dealData: { $exists: true },dealApproved:false }
        let accessFilter = {};

        let employeesReportingToUser = await Employee.find({ reportingTo: userId }, '_id');
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

        const filters = { $and: [matchFilters, accessFilter] }

        let total: number = 0;
        await Quotation.aggregate([
            {
                $match: filters
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            {
                $project: { total: 1, _id: 0 }
            }
        ]).exec()
            .then((result: { total: number }[]) => {
                if (result && result.length > 0) {
                    total = result[0].total
                }
            })

        let dealData = await Quotation.aggregate([
            {
                $match: filters,
            },
            {
                $sort: { createdDate: 1 }
            },
            {
                $skip: skipNum
            },
            {
                $limit: row
            },
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
                $lookup: {
                    from: 'enquiries',
                    localField: 'enqId',
                    foreignField: '_id',
                    as: 'enqId'
                }
            },
            {
                $unwind: {
                    path: '$enqId',
                    preserveNullAndEmptyArrays: true
                }
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

        if (!dealData || !total) return res.status(204).json({ err: 'No Deal data found' })
        return res.status(200).json({ total: total, dealSheet: dealData })

    } catch (error) {
        console.log(error)
    }
}


export const getNextQuoteId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quoteData = req.body;
        let quoteId: string = await generateQuoteId(quoteData.department, quoteData.createdBy, quoteData.date);

        if (!quoteId) return res.status(204).json({ err: 'Something went Wrong!' });
        return res.status(200).json({ quoteId });

    } catch (error) {
        console.log(error)
    }
}


const generateDealId = async () => {
    try {
        const lastQuote = await Quotation.aggregate([
            {
                $match: {
                    dealData: { $exists: true }
                }
            },
            {
                $addFields: {
                    lastNumber: {
                        $toInt: { $arrayElemAt: [{ $split: ["$dealData.dealId", "-"] }, -1] }
                    }
                }
            },
            {
                $sort: { lastNumber: -1 }
            },
            {
                $limit: 1
            }
        ])
        console.log(lastQuote)
        let dealId: string;


        const today = new Date();
        const currentYear = today.getFullYear();
        const year = currentYear.toString().slice(-2);

        if (lastQuote.length) {
            const lastNumber = lastQuote[0].lastNumber;
            const incrementedNum = parseInt(lastNumber) + 1;
            const formattedIncrementedNum = String(incrementedNum).padStart(3, '0');
            dealId = `DL-${year}-${formattedIncrementedNum}`
        } else {
            dealId = `DL-${year}-001`
        }
        return dealId;
    } catch (error) {
        console.log(error)
    }
}

const generateQuoteId = async (departmentId: string, employeeId: string, date: string) => {
    try {
        const lastQuote = await Quotation.aggregate([
            {
                $match: {
                    quoteId: { $exists: true }
                }
            },
            {
                $addFields: {
                    lastNumber: {
                        $toInt: { $arrayElemAt: [{ $split: ["$quoteId", "-"] }, -1] }
                    }
                }
            },
            {
                $sort: { lastNumber: -1 }
            },
            {
                $limit: 1
            }
        ])
        const department = await Department.findById(departmentId);
        const employee = await Employee.findById(employeeId);
        let quoteId: string;

        if (employee && department) {
            const salesId = `${employee.firstName[0]}${employee.lastName[0]}`;
            const departmentName = department.departmentName.split(' ')[0].replace(/\s/g, "").toUpperCase().slice(0, 4);

            const [year, month] = date.split('-');
            const formatedDate = `${month}/${year.substring(2)}`;

            if (lastQuote.length) {
                const lastNumber = lastQuote[0].lastNumber;
                const incrementedNum = parseInt(lastNumber) + 1;
                const formattedIncrementedNum = String(incrementedNum).padStart(3, '0');
                quoteId = `QN-NT/${salesId}/${departmentName}-${formatedDate}-${formattedIncrementedNum}`
            } else {
                quoteId = `QN-NT/${salesId}/${departmentName}-${formatedDate}-001`
            }
        }
        return quoteId;
    } catch (error) {
        console.log(error)
    }
}


export const updateQuoteStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        const { quoteId } = req.params;
        const quoteUpdated = await Quotation.findByIdAndUpdate(quoteId, { status: status })

        if (quoteUpdated) {
            return res.status(200).json(status)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const updateQuotation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quoteData = req.body;
        const { quoteId } = req.params;

        const quoteUpdated = await Quotation.findByIdAndUpdate(quoteId, quoteData)

        if (quoteUpdated) {
            return res.status(200).json(quoteUpdated)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const saveDealSheet = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { paymentTerms, items, costs } = req.body;
        let dealId: string = await generateDealId();

        const createdDate = new Date()
        let updateQuoteData = {
            items: items,
            dealData: {
                dealId: dealId,
                paymentTerms,
                additionalCosts: costs,
                savedDate: createdDate
            }
        }

        const { quoteId } = req.params;
        const quoteUpdated = await Quotation.findByIdAndUpdate(quoteId, updateQuoteData, { new: true });

        if (quoteUpdated) {
            return res.status(200).json(quoteUpdated)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}
export const approveDeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('andimukk ivde ethinna thonninath')
        const jobId = await generateJobId()
        const jobData = {
            quoteId: req.body.quoteId,
            jobId: jobId
        }

        const job = new Job(jobData);
        const saveJob = await job.save()
        if (saveJob) {
            const quoteUpdate = await Quotation.updateOne({_id:jobData.quoteId},{dealApproved:true})
            if (quoteUpdate) {
                return res.status(200).json({ success: true })
            }
        }

        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const uploadLpo = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (!req.files) return res.status(204).json({ err: 'No data' })

        const lpoFiles = req.files;
        const files = lpoFiles.map((file: any) => { return { fileName: file.filename, originalname: file.originalname } });

        const lpoValue = req.body.lpoValue;

        const quote = await Quotation.findByIdAndUpdate(req.body.quoteId, { lpoSubmitted: true, lpoValue: lpoValue, lpoFiles: files });
        if (quote) {
            return res.status(200).json(quote);
        }

        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const totalQuotation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { access, userId } = req.query;

        let accessFilter = {};

        let employeesReportingToUser = await Employee.find({ reportingTo: userId }, '_id');
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

        const totalQuotes = await Quotation.aggregate([
            {
                $match: accessFilter
            },
            {
                $group: {
                    _id: null, total: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: 1
                }
            }
        ])

        if (totalQuotes.length === 0) {
            totalQuotes.push({ total: 0 });
        }

        if (totalQuotes) return res.status(200).json(totalQuotes[0])

        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}


const generateJobId = async () => {
    try {
        const lastJob = await Job.findOne({}, {}, { sort: { jobId: -1 } });
        let lastJobId: String;
        let jobId: string;

        if (lastJob) {
            lastJobId = lastJob.jobId
        }
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}/${month}`;

        if (lastJob && lastJobId) {
            const IdNumber = lastJobId.split('-')
            const incrementedNum = parseInt(IdNumber[1]) + 1;
            const formattedIncrementedNum = incrementedNum.toString().padStart(4, '0');
            jobId = `${formattedDate}-${formattedIncrementedNum}`
        } else {
            jobId = `${formattedDate}-0100`
        }
        return jobId;
    } catch (error) {
        console.log(error)
    }
}