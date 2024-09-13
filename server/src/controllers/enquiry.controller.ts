import { NextFunction, Request, Response } from "express"
import enquiryModel from "../models/enquiry.model";
import Employee from '../models/employee.model';
import Department from '../models/department.model';
import { Enquiry } from "../interface/enquiry.interface";
import { Server } from "socket.io";
const { ObjectId } = require('mongodb')

export const createEnquiry = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (!req.files) return res.status(204).json({ err: 'No data' })
        const enquiryFiles = req.files.attachments
        const presaleFiles = req.files.presaleFiles

        const enquiryData = <Enquiry>JSON.parse(req.body.enquiryData)

        let enqId: string = await generateEnquiryId(enquiryData.department, enquiryData.salesPerson, enquiryData.date as string);

        enquiryData.enquiryId = enqId;
        enquiryData.attachments = []
        if (enquiryFiles) {
            enquiryData.attachments = enquiryFiles
        }

        if (req.body.presalePerson) {
            const presalePerson = JSON.parse(req.body.presalePerson)
            const presaleComment = JSON.parse(req.body.presaleComment)
            enquiryData.preSale = { presalePerson: presalePerson, presaleFiles: [], comment: presaleComment, newFeedbackAccess: true }
            if (presaleFiles) {
                enquiryData.preSale.presaleFiles = presaleFiles
            }
            const socket = req.app.get('io') as Server;
            socket.to(presalePerson).emit("notifications", 'assignedJob')
        }

        enquiryData.date = new Date(enquiryData.date)
        const newEnquiry = new enquiryModel(enquiryData)
        const saveEnquiryData = await newEnquiry.save()
        if (!saveEnquiryData) return res.status(504).json({ err: 'Internal Error' });

        const savedEnquiryData = await enquiryModel.aggregate([
            {
                $match: { "_id": saveEnquiryData._id }
            },
            {
                $lookup: { from: 'customers', localField: 'client', foreignField: '_id', as: 'client' }
            },
            {
                $unwind: '$client'
            },
            {
                $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
            },
            {
                $unwind: '$department'
            },
            {
                $lookup: { from: 'employees', localField: 'salesPerson', foreignField: '_id', as: 'salesPerson' }
            },
            {
                $unwind: '$salesPerson'
            },
            {
                $addFields: {
                    contact: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: '$client.contactDetails',
                                    as: 'contact',
                                    cond: {
                                        $eq: ['$$contact._id', '$contact']
                                    }
                                }
                            },
                            0
                        ]
                    }
                }
            }
        ]);

        return res.status(200).json(savedEnquiryData[0]);
    } catch (error) {
        next(error)
    }
}

export const assignPresale = async (req: any, res: Response, next: NextFunction) => {
    try {
        const presale = JSON.parse(req.body.presaleData)
        const presaleFiles = req.files.presaleFiles;
        let enquiryId = req.params.enquiryId;
        console.log(req.files)
        if (presaleFiles) {
            presale.presaleFiles = presaleFiles
        }

        const update = await enquiryModel.updateOne({ _id: enquiryId }, { $set: { preSale: presale, status: 'Assigned To Presales', 'preSale.newFeedbackAccess': true } });
        const socket = req.app.get('io') as Server;
        socket.to(presale.presalePerson).emit("notifications", 'assignedJob')
        if (update.modifiedCount) return res.status(200).json({ success: true })

        return res.status(502).json()
    } catch (error) {

    }
}

export const getEnquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page, row, salesPerson, status, fromDate, toDate, department, access, userId } = req.body;
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

        let accessFilter = {};

        let employeesReportingToUser = await Employee.find({ reportingTo: userId }, '_id');
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

        const filters = { $and: [matchFilters, accessFilter] }

        const enquiryTotal: { total: number }[] = await enquiryModel.aggregate([
            { $match: filters },
            { $match: { status: { $ne: 'Quoted' } } },
            { $group: { _id: null, total: { $sum: 1 } } },
            { $project: { total: 1, _id: 0 } }
        ]).exec()

        const enquiryData = await enquiryModel.aggregate([
            { $match: filters },
            { $match: { status: { $ne: 'Quoted' } } },
            { $sort: { _id: -1 } },
            { $skip: skipNum },
            { $limit: row },
            {
                $lookup: { from: 'customers', localField: 'client', foreignField: '_id', as: 'client' }
            },
            { $unwind: '$client' },
            {
                $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
            },
            { $unwind: '$department' },
            {
                $lookup: { from: 'employees', localField: 'salesPerson', foreignField: '_id', as: 'salesPerson' }
            },
            { $unwind: '$salesPerson' },
            {
                $addFields: {
                    contact: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: '$client.contactDetails',
                                    as: 'contact',
                                    cond: {
                                        $eq: ['$$contact._id', '$contact']
                                    }
                                }
                            },
                            0
                        ]
                    }
                }
            }
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
        let { filter, access, userId } = req.query;
        let accessFilter: any = { status: 'Assigned To Presales' };
        switch (access) {
            case 'assigned':
                accessFilter['preSale.presalePerson'] = new ObjectId(userId);
                break;
            default:
                break;
        }

        if (filter == 'completed') {
            accessFilter.status = 'Work In Progress'
        }

        const totalPresale: { total: number }[] = await enquiryModel.aggregate([
            {
                $match: accessFilter
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            { $project: { _id: 0, total: 1 } }
        ])

        const preSaleData = await enquiryModel.aggregate([
            {
                $match: accessFilter
            },
            {
                $addFields: {
                    lastNumber: {
                        $toInt: { $arrayElemAt: [{ $split: ["$enquiryId", "-"] }, -1] }
                    }
                }
            },
            {
                $sort: { lastNumber: -1 }
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
            {
                $lookup: {
                    from: 'employees',
                    localField: 'preSale.feedback.employeeId',
                    foreignField: '_id',
                    as: 'employeeDetails'
                }
            },
            {
                $addFields: {
                    "preSale.feedback": {
                        $map: {
                            input: "$preSale.feedback",
                            as: "feedback",
                            in: {
                                $mergeObjects: [
                                    "$$feedback",
                                    {
                                        employeeId: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$employeeDetails",
                                                        as: "emp",
                                                        cond: { $eq: ["$$emp._id", "$$feedback.employeeId"] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $lookup: { from: 'employees', localField: 'preSale.presalePerson', foreignField: '_id', as: 'preSale.presalePerson' }
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
        const update = await enquiryModel.findOneAndUpdate({ _id: data.id }, { $set: { status: data.status, 'preSale.seenbySalesPerson': false, 'preSale.newFeedbackAccess': true } })
            .populate(['client', 'department', 'salesPerson'])
        if (update) {
            const socket = req.app.get('io') as Server;
            socket.to(update.salesPerson._id.toString()).emit("notifications", 'enquiry')
            return res.status(200).json(update)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const monthlyEnquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { access, userId } = req.query;

        let accessFilter = {};
        let employeesReportingToUser = await Employee.find({ reportingTo: userId }, '_id');
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
        const result = await enquiryModel.aggregate([
            {
                $match: accessFilter
            },
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

export const sendFeedbackRequest = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { employeeId, enquiryId, comment } = req.body;

        const newFeedback = {
            employeeId,
            comment,
            requestedDate: Date.now(),
            seenByFeedbackProvider: false,
            seenByFeedbackRequester: false,
        };

        const result = await enquiryModel.findOneAndUpdate(
            { _id: enquiryId },
            {
                $push: { "preSale.feedback": newFeedback },
                $set: { 'preSale.newFeedbackAccess': false }
            },
            { new: true }
        ).populate('client')
            .populate('department')
            .populate('salesPerson')
            .populate({
                path: 'preSale.feedback.employeeId',
                model: 'Employee'
            });

        if (result) {
            const socket = req.app.get('io') as Server;
            socket.to(employeeId).emit("notifications", 'feedbackRequest');
            return res.status(200).json(result);
        }

        return res.status(502).json();
    } catch (error) {
        next(error);
    }
}


export const getFeedbackRequestsById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employeeId = req.params.employeeId;
        let page = Number(req.query.page);
        let row = Number(req.query.row);
        let skipNum: number = (page - 1) * row;

        const totalFeedbacks: { total: number }[] = await enquiryModel.aggregate([
            {
                $unwind: "$preSale.feedback"
            },
            {
                $match: {
                    "preSale.feedback.employeeId": new ObjectId(employeeId),
                    "preSale.feedback.feedback": { $exists: false }
                }
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            { $project: { _id: 0, total: 1 } }
        ]);

        const feedbacks = await enquiryModel.aggregate([
            { $unwind: "$preSale.feedback" },
            {
                $match: {
                    "preSale.feedback.employeeId": new ObjectId(employeeId),
                    "preSale.feedback.feedback": { $exists: false }
                }
            },
            {
                $sort: { "preSale.feedback.requestedDate": -1 }
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
            {
                $lookup: { from: 'employees', localField: 'preSale.feedback.employeeId', foreignField: '_id', as: 'preSale.feedback.employeeId' }
            },
            {
                $lookup: { from: 'employees', localField: 'preSale.presalePerson', foreignField: '_id', as: 'preSale.presalePerson' }
            }
        ]);


        if (totalFeedbacks.length) return res.status(200).json({ total: totalFeedbacks[0].total, feedbacks: feedbacks });
        return res.status(502).json();
    } catch (error) {
        next(error);
    }
}



export const giveFeedback = async (req: any, res: Response, next: NextFunction) => {
    try {
        let { enquiryId, feedbackId, feedback } = req.body;

        const result = await enquiryModel.findOneAndUpdate(
            { _id: enquiryId, "preSale.feedback._id": feedbackId },
            {
                $set: {
                    "preSale.feedback.$.feedback": feedback,
                    "preSale.feedback.$.seenByFeedbackRequester": false
                }
            },
            { new: true }
        );

        if (result) {
            const socket = req.app.get('io') as Server;
            const presalePerson = result.preSale.presalePerson.toString();
            socket.to(presalePerson).emit("notifications", 'assignedJob');
            return res.status(200).json({ success: true });
        }

        return res.status(502).json();
    } catch (error) {
        next(error);
    }
}

export const giveRevision = async (req: any, res: Response, next: NextFunction) => {
    try {
        let { revisionComment } = req.body;
        let enquiryId = req.params.enquiryId;
        const result = await enquiryModel.findOneAndUpdate(
            { _id: enquiryId },
            {
                $push: { 'preSale.revisionComment': revisionComment },
                status: 'Assigned To Presales',
                'preSale.seenbyEmployee': false,
                'preSale.newFeedbackAccess': true
            },
            { new: true }
        );

        const socket = req.app.get('io') as Server;
        socket.to(result.preSale.presalePerson.toString()).emit("notifications", 'assignedJob')

        if (!result) {
            return res.status(404).send('Enquiry not found or comment not added.');
        }

        return res.status(200).json({ success: true })
    } catch (error) {
        next(error)
    }
}

export const uploadEstimations = async (req: any, res: Response, next: NextFunction) => {
    try {
        let { items, enquiryId, currency, totalDiscount, preSaleNote } = req.body;
        console.log(req.body);
        const enquiryData = await enquiryModel.updateOne(
            { _id: new ObjectId(enquiryId) },
            {
                $set: {
                    'preSale.estimations.items': items,
                    'preSale.estimations.currency': currency,
                    'preSale.estimations.totalDiscount': totalDiscount,
                    'preSale.estimations.presaleNote': preSaleNote,
                }
            }
        );

        if (!enquiryData.modifiedCount) {
            return res.status(502).json();
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}


const generateEnquiryId = async (departmentId: string, employeeId: string, date: string) => {
    try {
        const lastEnquiry = await enquiryModel.aggregate([
            {
                $match: {
                    enquiryId: { $exists: true }
                }
            },
            {
                $addFields: {
                    lastNumber: {
                        $toInt: { $arrayElemAt: [{ $split: ["$enquiryId", "-"] }, -1] }
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

            if (lastEnquiry.length) {
                const lastNumber = lastEnquiry[0].lastNumber;
                const incrementedNum = parseInt(lastNumber) + 1;
                const formattedIncrementedNum = String(incrementedNum).padStart(3, '0');
                quoteId = `ENQ-NT/${salesId}/${departmentName}-${formatedDate}-${formattedIncrementedNum}`
            } else {
                quoteId = `ENQ-NT/${salesId}/${departmentName}-${formatedDate}-001`
            }
        }
        return quoteId;
    } catch (error) {
        console.log(error)
    }
}



export const presalesCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { access, userId } = req.query;

        let accessFilter: any = { status: 'Assigned To Presales' };

        switch (access) {
            case 'assigned':
                accessFilter = { "preSale.presalePerson": userId };
                break;
            default:
                break;
        }

        const totalPendingJobs: { total: number }[] = await enquiryModel.aggregate([
            {
                $match: accessFilter
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            {
                $project: { _id: 0, total: 1 }
            }
        ])

        accessFilter.status = 'Work In Progress'

        const totalCompletedJobs: { total: number }[] = await enquiryModel.aggregate([
            {
                $match: accessFilter
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            {
                $project: { _id: 0, total: 1 }
            }
        ])

        let presaleCounts = {
            pending: totalPendingJobs[0]?.total || 0,
            completed: totalCompletedJobs[0]?.total || 0
        };


        if (presaleCounts) return res.status(200).json(presaleCounts)

        return res.status(502).json()
    } catch (error) {
        next(error);
    }
};


export const markAsSeenEstimation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const enquiryId: string = req.body.enquiryId


        const result = await enquiryModel.updateOne(
            { _id: enquiryId },
            { $set: { 'preSale.seenbySalesPerson': true } }
        );

        console.log(result)

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No enquiries found' });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const markAsSeenJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobIds: string = req.body.jobId


        const result = await enquiryModel.updateOne(
            { _id: jobIds },
            { $set: { 'preSale.seenbyEmployee': true } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No enquiries found' });
        }

        res.status(200).json({ message: 'Enquiries marked as seen', result });
    } catch (error) {
        next(error);
    }
};

export const markAsSeenFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { enqId, feedbackId } = req.body;

        const result = await enquiryModel.updateOne(
            { _id: new ObjectId(enqId), "preSale.feedback._id": feedbackId },
            { $set: { "preSale.feedback.$.seenByFeedbackProvider": true } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No matching feedback found' });
        }

        res.status(200).json({ message: 'Feedback marked as seen', result });
    } catch (error) {
        next(error);
    }
};

export const markFeedbackResponseAsViewed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { enqId, feedbackId } = req.body;

        const result = await enquiryModel.updateOne(
            { _id: enqId, "preSale.feedback._id": feedbackId },
            { $set: { "preSale.feedback.$.seenByFeedbackRequester": true } },
            { new: true }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No feedback found' });
        }

        res.status(200).json({ message: 'Feedback response marked as viewed', result });
    } catch (error) {
        next(error);
    }
};

