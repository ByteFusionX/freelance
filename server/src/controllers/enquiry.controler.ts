import { NextFunction, Request, Response } from "express"
import enquiryModel from "../models/enquiry.model"
import { json } from "stream/consumers"

export const createEnquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) return res.status(204).json({ err: 'No data' })
        const enquiryData = req.body
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
        const enquiryData = await enquiryModel.find()
            .populate(['client', 'department', 'salesPerson'])

        if (!enquiryData.length) return res.status(504).json({ err: 'No enquiry data found' })

        return res.status(200).json(enquiryData)
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