import { NextFunction, Response, Request } from "express";
import Quotation from '../models/quotation.model';
import Job from '../models/job.model';
import Department from '../models/department.model';
import Employee from '../models/employee.model'
import { Customer } from "../models/customer.model";


export const saveQuotation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quoteData = req.body;
        let quoteId: string = await generateQuoteId(quoteData.department, quoteData.createdBy, quoteData.date);
        quoteData.quoteId = quoteId;
        console.log(quoteId, quoteData);

        const quote = new Quotation(quoteData)

        const saveQuote = await (await quote.save()).populate('department')
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
        let quoteData = await Quotation.aggregate([
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
        if (!quoteData.length) return res.status(504).json({ err: 'No quote data found' })

        return res.status(200).json(quoteData)
    } catch (error) {
        console.log(error)
    }
}

const generateQuoteId = async (departmentId: string, employeeId: string, date: string) => {
    try {
        const lastQuote = await Quotation.findOne({}, {}, { sort: { quoteId: -1 } });
        const department = await Department.findById(departmentId);
        const employee = await Employee.findById(employeeId);
        let lastQuoteId: String;
        let quoteId: string;

        if (lastQuote) {
            lastQuoteId = lastQuote.quoteId
        }
        if (employee && department) {
            const salesId = `${employee.firstName[0]}${employee.lastName[0]}`;
            const departmentName = department.departmentName.split(' ')[0].replace(/\s/g, "").toUpperCase().slice(0, 4);

            const [year, month] = date.split('-');
            const formatedDate = `${month}/${year.substring(2)}`;

            if (lastQuote && lastQuoteId) {
                const IdNumber = lastQuoteId.split('-')
                const incrementedNum = parseInt(IdNumber[3]) + 1;
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
            return res.status(200).json(quoteUpdated.status)
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

export const uploadLpo = async (req: any, res: Response, next: NextFunction) => {
    try {    
        if (!req.files) return res.status(204).json({ err: 'No data' })
        console.log(req.files)
        const jobId = await generateJobId() 

        const lpoFiles = req.files;
        const files = lpoFiles.map((file: any) => file.filename);
        
        const jobData = {
            quoteId: req.body.quoteId,
            jobId: jobId,
            files: files
        }

        const job = new Job(jobData)
        const saveJob = await (await job.save()).populate('quoteId')

        if (saveJob) {
            return res.status(200).json(saveJob)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const totalQuotation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const totalQuotes = await Quotation.aggregate([
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