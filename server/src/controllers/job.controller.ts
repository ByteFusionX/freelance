import { NextFunction, Request, Response } from "express"
import jobModel from "../models/job.model"
import enquiryModel from "../models/enquiry.model"

const { ObjectId } = require('mongodb')

export const jobList = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        let {page,row,status} = req.body
        console.log(req.body)
        let isStatus = status == null ? true : false;
        let skipNum: number = (page - 1) * row;
        let matchFilters = {
            $and: [
                { $or: [{ status: status }, { status: { $exists: isStatus } }] },
            ]
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
            
        ]);

        const jobTotal: { total: number }[] = await jobModel.aggregate([
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

        console.log(jobData)
        if (jobTotal.length) return res.status(200).json({ total: jobTotal[0].total, job: jobData })
        return res.status(504).json({ err: 'No job data found' })

    } catch (error) {
        next(error)
    }
}

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
    
