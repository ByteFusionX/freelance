"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnouncement = exports.createAnnouncement = void 0;
const announcement_model_1 = __importDefault(require("../models/announcement.model"));
const createAnnouncement = async (req, res, next) => {
    try {
        const { title, description, date } = req.body;
        const addAcnnouncement = new announcement_model_1.default({
            title,
            date,
            description,
            celeb: false
        });
        const saveAnnouncement = await addAcnnouncement.save();
        if (saveAnnouncement)
            return res.status(200).json(true);
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.createAnnouncement = createAnnouncement;
const getAnnouncement = async (req, res, next) => {
    try {
        const announcementData = await announcement_model_1.default.find().sort({ createdDate: -1 });
        if (announcementData.length)
            return res.status(200).json(announcementData);
        return res.status(202).json();
    }
    catch (error) {
        next(error);
    }
};
exports.getAnnouncement = getAnnouncement;
//# sourceMappingURL=announcment.controller.js.map