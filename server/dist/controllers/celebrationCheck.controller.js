"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.celebrationCheck = void 0;
const announcement_model_1 = __importDefault(require("../models/announcement.model"));
const celebrationCheck = async (req, res, next) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(today.getUTCDate() + 1);
        const celebData = await announcement_model_1.default.find({
            $and: [
                { celeb: true },
                { date: { $gte: today, $lt: tomorrow } }
            ]
        });
        if (celebData.length)
            return res.status(200).json(celebData);
    }
    catch (error) {
        next(error);
    }
};
exports.celebrationCheck = celebrationCheck;
//# sourceMappingURL=celebrationCheck.controller.js.map