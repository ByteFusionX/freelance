import { Request, Response, NextFunction } from "express";
import { nextTick } from "process";
import Enquiry from "../models/enquiry.model";
import fs from "fs";
import path from "path";
import { File } from "../interface/enquiry.interface";
const { ObjectId } = require('mongodb')

export const DownloadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fileName = req.query.file;
        console.log(fileName)
        const uploadsDir = path.resolve(__dirname, '../..', 'uploads');
        const filePath = path.join(uploadsDir, fileName as string);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.download(filePath, (error) => {
            if (error) {
                //   console.error('Error while downloading file:', error);
                return res.status(404).json({ message: 'File not found' });
            }
        });
    } catch (error) {
        console.error('An error occurred while processing the request:', error);
        next(error);
    }
};

export const fetchFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filename = req.params.filename
        const filePath = path.join(__dirname, '../../uploads', filename);
        res.sendFile(filePath, (error) => {
            if (error) {
                return res.status(404).json({ mesage: 'file not found' })
            }
        })
    } catch (error) {
        console.error(error);

        next(error)
    }
}


export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fileName = req.query.file;
        const enquiryId = req.query.enquiryId;
        const uploadsDir = path.resolve(__dirname, '../..', 'uploads');
        const filePath = path.join(uploadsDir, fileName as string);
        console.log(filePath);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            const deleteFile = await Enquiry.updateOne(
                { "_id": new ObjectId(enquiryId) },
                { $pull: { "assignedFiles": { "filename": fileName } } }
            );
            if (deleteFile.modifiedCount) {
                res.status(200).json('File Deleted')
            }
        } else {
            res.status(404).send('File not found');
        }
    } catch (error) {
        next(error);
    }
}

export const clearAllPresaleFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const enquiryId = req.query.enquiryId;
        const presaleFiles = await Enquiry.findById(enquiryId);
        presaleFiles.assignedFiles.forEach((file: File) => {
            const uploadsDir = path.resolve(__dirname, '../..', 'uploads');
            const filePath = path.join(uploadsDir, file.filename as string);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        })
        const deleteFile = await Enquiry.updateOne(
            { "_id": new ObjectId(enquiryId) },
            { $set: { "assignedFiles": [] } }
        );
        if (deleteFile.modifiedCount) {
            res.status(200).json('All Files Deleted')
        } else {
            res.status(404).send('Something went Wrong');
        }
    } catch (error) {
        next(error)
    }
}