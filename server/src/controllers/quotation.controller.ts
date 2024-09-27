import { NextFunction, Response, Request } from "express";
import Quotation, { quoteStatus } from '../models/quotation.model';
import Job from '../models/job.model';
import Department from '../models/department.model';
import Employee from '../models/employee.model'
import Enquiry from "../models/enquiry.model";
import { Server } from "socket.io";
import { calculateDiscountPrice, getUSDRated } from "../common/util";
const { ObjectId } = require('mongodb');
import { removeFile } from '../common/util'


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
        let { page, search, row, salesPerson, customer, fromDate, toDate, department, access, userId } = req.body;
        let skipNum: number = (page - 1) * row;

        let searchRegex = search.split('').join('\\s*');
        let fullNameRegex = new RegExp(searchRegex, 'i');

        let isSalesPerson = salesPerson == null ? true : false;
        let isCustomer = customer == null ? true : false;
        let isDate = fromDate == null || toDate == null ? true : false;
        let isDepartment = department == null ? true : false;

        let matchFilters = {
            $and: [
                { quoteId: { $regex: search, $options: 'i' } },
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

        let matchFilters = {
            dealData: { $exists: true },
            'dealData.status': { $nin: ['rejected', 'approved'] }
        };

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
                $sort: { 'dealData.savedDate': -1 }
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

export const markAsSeenDeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quoteIds: string = req.body.quoteIds;

        const result = await Quotation.updateMany(
            { _id: quoteIds },
            { $set: { 'dealData.seenByApprover': true } },
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No Deal found' });
        }

        res.status(200).json({ message: 'Deal marked as seen', result });
    } catch (error) {
        next(error);
    }
};



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

export const saveDealSheet = async (req: any, res: Response, next: NextFunction) => {
    try {
        const dealFiles = req.files;

        let files = [];
        if (dealFiles) {
            files = dealFiles.map((file: any) => { return { fileName: file.filename, originalname: file.originalname } });
        }

        const { paymentTerms, items, removedFiles, existingFiles, costs } = JSON.parse(req.body.dealData);
        files = [...files, ...existingFiles]
        removedFiles.map((file: any) => removeFile(file.fileName))
        
        let dealId: string = await generateDealId();

        const createdDate = new Date()
        let updateQuoteData = {
            dealData: {
                dealId: dealId,
                paymentTerms,
                additionalCosts: costs,
                savedDate: createdDate,
                status: 'pending',
                attachments: files,
                updatedItems: items
            },
        }

        const socket = req.app.get('io') as Server;
        socket.emit("notifications", 'dealSheet')

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
        const jobId = await generateJobId()
        const jobData = {
            quoteId: req.body.quoteId,
            jobId: jobId
        }

        const job = new Job(jobData);
        const saveJob = await job.save()
        if (saveJob) {
            const quoteUpdate = await Quotation.updateOne({ _id: jobData.quoteId }, { 'dealData.status': 'approved', 'dealData.seenedBySalsePerson': false })
            if (quoteUpdate) {
                const socket = req.app.get('io') as Server;
                socket.emit("notifications", 'quotation')
                return res.status(200).json({ success: true });
            }
        }

        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const rejectDeal = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { quoteId, comment } = req.body;
        const deal = await Quotation.findById(quoteId);
        if (!deal) {
            return res.status(502).json({ message: 'Deal not found' });
        }
        deal.dealData.status = 'rejected';
        deal.dealData.seenedBySalsePerson = false
        deal.dealData.comments.push(comment);
        await deal.save();

        const socket = req.app.get('io') as Server;
        socket.emit("notifications", 'quotation')

        return res.status(200).json({ success: true })

    } catch (error) {
        next(error)
    }
}

export const uploadLpo = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (!req.files) return res.status(204).json({ err: 'No data' })

        const lpoFiles = req.files;
        const files = lpoFiles.map((file: any) => { return { fileName: file.filename, originalname: file.originalname } });


        const quote = await Quotation.findByIdAndUpdate(req.body.quoteId, { lpoSubmitted: true, lpoFiles: files });
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
                $match: {
                    'dealData.status': { $ne: 'approved' }
                }
            },
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

export const getReportDetails = async (req: Request, res: Response) => {
    try {
        let { salesPerson, customer, fromDate, toDate, department, access, userId } = req.body;
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

        const quotations = await Quotation.aggregate([
            {
                $match: filters
            },
        ])

        const jobQuoataions = await Quotation.aggregate([
            {
                $match: filters
            },
            {
                $lookup: {
                    from: 'jobs',
                    localField: '_id',
                    foreignField: 'quoteId',
                    as: 'jobs'
                }
            },
            {
                $match: {
                    'jobs.0': { $exists: true }
                }
            },
            {
                $project: {
                    jobs: 0
                }
            }
        ])

        const totalValues = quotations.reduce((acc: any, quote: any) => {
            if (quote.currency == 'USD') {
                acc.totalUSDValue += calculateDiscountPrice(quote, quote.items);
            } else if (quote.currency == 'QAR') {
                acc.totalQARValue += calculateDiscountPrice(quote, quote.items);
            }

            if (quote.status === quoteStatus.Won) {
                if (quote.currency == 'USD') {
                    acc.totalUSDWonValue += calculateDiscountPrice(quote, quote.items);
                } else if (quote.currency == 'QAR') {
                    acc.totalQARWonValue += calculateDiscountPrice(quote, quote.items);
                }
            } else if (quote.status === quoteStatus.Lost) {
                if (quote.currency == 'USD') {
                    acc.totalUSDLossValue += calculateDiscountPrice(quote, quote.items);
                } else if (quote.currency == 'QAR') {
                    acc.totalQARLossValue += calculateDiscountPrice(quote, quote.items);
                }
            }
            acc.statusCounts[quote.status] = (acc.statusCounts[quote.status] || 0) + 1;
            return acc;
        }, {
            totalUSDValue: 0,
            totalQARValue: 0,
            totalUSDWonValue: 0,
            totalQARWonValue: 0,
            totalUSDLossValue: 0,
            totalQARLossValue: 0,
            statusCounts: {}
        });

        const totalJobAwardedUQ = jobQuoataions.reduce((acc: any, quote: any) => {
            if (quote.currency == 'USD') {
                acc.totalUSDJobAwarded += calculateDiscountPrice(quote, quote.items);
            } else if (quote.currency == 'QAR') {
                acc.totalQARJobAwarded += calculateDiscountPrice(quote, quote.items);
            }
            return acc
        }, {
            totalUSDJobAwarded: 0,
            totalQARJobAwarded: 0
        })

        const pieChartData = Object.keys(totalValues.statusCounts).map(status => ({
            name: status,
            value: totalValues.statusCounts[status]
        }));

        const USDRates = await getUSDRated();

        const qatarUsdRates = USDRates.usd.qar;
        const tatalValue = totalValues.totalQARValue + (totalValues.totalUSDValue * qatarUsdRates);
        const totalWonValue = totalValues.totalQARValue + (totalValues.totalUSDWonValue * qatarUsdRates);
        const totalLossValue = totalValues.totalQARLossValue + (totalValues.totalUSDLossValue * qatarUsdRates);
        const totalJobAwarded = totalJobAwardedUQ.totalQARJobAwarded + (totalJobAwardedUQ.totalUSDJobAwarded * qatarUsdRates);

        if (totalValues && pieChartData) {
            return res.status(200).json({
                totalValue: tatalValue,
                totalWonValue: totalWonValue,
                totalLossValue: totalLossValue,
                totalJobAwarded: totalJobAwarded,
                pieChartData
            })
        }

        return res.status(502).json();
    } catch (error) {
        console.error(error);
    }
};


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



export const markAsQuotationSeened = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { quoteId, userId } = req.body;

        if (!quoteId || !userId) {
            return res.status(400).json({ message: "quoteId and userId are required." });
        }
        const updateResult = await Quotation.updateOne(
            {
                _id: new ObjectId(quoteId),
                createdBy: new ObjectId(userId),
            },
            {
                $set: {
                    "dealData.seenedBySalsePerson": true
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: "No matching quotation found." });
        }

        if (updateResult.modifiedCount === 0) {
            return res.status(304).json({ message: "Quotation was already marked as seen." });
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        next(error);
    }
};


