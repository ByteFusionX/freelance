import { NextFunction, Request, Response } from "express"
import preSalesModel from "../models/preSales.model"

export const assignToPreSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) return res.status(204).json({ err: 'No data' })
        let { enquiryId, description, employee, attachment, createdBy } = req.body

        let preSaleData = new preSalesModel({
            enquiryId,
            description,
            employee,
            attachment,
            createdBy
        })
        let savePreSaleData = await preSaleData.save()

        if (!savePreSaleData) return res.status(504).json({ err: 'Internal Error' })
        return res.status(200).json(true)
    } catch (error) {
        next(error)
    }
}

export const getPreSalesData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const getPreSalesData = await preSalesModel.find().populate('employee').populate('createdBy')

        if (!getPreSalesData.length) return res.status(504).json({ err: 'No pre-sales data found' })

        return res.status(200).json(getPreSalesData)
    } catch (error) {
        next(error)
    }
}

