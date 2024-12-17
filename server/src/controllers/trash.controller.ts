import { NextFunction, Response, Request } from "express";
import Trash from '../models/trash.model'
import Department from '../models/department.model'
import InternalDepartment from '../models/internal.department'
const allowedModels = ['Employee', 'Customer', 'Quotation', 'Enquiry', 'Department', 'InternalDepartment', 'Category'];

export const newTrash = async (from: string, dataId: string, employee: string) => {
    if (!allowedModels.includes(from)) {
        throw new Error(`${from} is not a valid model for Trash.`);
    }

    const newTrash = new Trash({
        deletedFrom: from,
        deletedData: dataId,
        deletedBy: employee,
        date: new Date()
    })
    await newTrash.save()
    return
}


export const fetchTrash = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trashes = await Trash.find().populate(['deletedData', 'deletedBy']).sort({ date: -1 })
        return res.status(200).json(trashes)
    } catch (error) {
        next(error)
    }
}

export const restoreTrash = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { from, dataId } = req.body
        if (from == 'Department') {
            const update = await Department.findOneAndUpdate({ _id: dataId }, { $set: { isDeleted: false } })
        } else if (from == 'InternalDepartment') {
            const update = await InternalDepartment.findOneAndUpdate({ _id: dataId }, { $set: { isDeleted: false } })
        }

        const deleteTrash = await Trash.findOneAndDelete({ deletedData: dataId })
        if (deleteTrash) {
            return res.status(200).json({ message: `${from} restored successfully` })
        }
        return res.status(502).json
    } catch (error) {
        next(error)
    }
}