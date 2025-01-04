import { NextFunction, Request, Response } from "express"
import { uploadFileToAws } from "../common/aws-connect";
import Event from '../models/events.model';
import Enquiry from '../models/enquiry.model';

export const newEvent = async (req: any, res: Response, next: NextFunction) => {
    try {
        const eventData = JSON.parse(req.body.eventData)
        let eventFiles = []
        if (req.files?.eventFile) {
            eventFiles = await Promise.all(req.files.eventFile.map(async (file: any) => {
                // await uploadFileToAws(file.filename, file.path);
                return { fileName: file.filename, originalname: file.originalname };
            }));
        }

        if (eventFiles.length) {
            eventFiles.forEach((file) => eventData.eventFiles.push(file));
        }

        eventData.eventFiles = eventData.eventFiles.filter(
            (file) => Object.keys(file).length > 0
        );

        const newEvent = new Event(eventData)
        await newEvent.save();
        switch (eventData.from) {
            case 'Enquiry':
                await Enquiry.findOneAndUpdate({ _id: eventData.collectionId }, { $set: { eventId: newEvent._id } })
                break;

            default:
                break;
        }
        if (newEvent) {
            return res.status(200).json({ message: 'Event created successfully' })
        }
        return res.status(500).json({message: 'Event failed to create'})
    } catch (error) {
        next(error)
    }
}