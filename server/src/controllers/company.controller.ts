import { Request, Response, NextFunction } from "express";
import Company from "../models/company.model"




export const getCompanyDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const company = await Company.findOne({
            name: { $exists: true },
            description: { $exists: true },
            address: { $exists: true }
        }).select('name description address');

        if (company) {
            return res.status(200).json(company);
        }
        return res.status(204).json();
    } catch (error) {
        next(error);
    }
};


export const updateCompanyDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyName, description, street, area, city, country } = req.body


        const companyUpdate = await Company.updateOne(
            {},
            {
                $set: {
                    name: companyName,
                    description: description,
                    address: {
                        street: street,
                        area: area,
                        city: city,
                        country: country
                    }
                }
            },
            { upsert: true }
        );

        if (companyUpdate) {
            return res.status(200).json(companyUpdate)
        }
        return res.status(204).json()
    } catch (error) {
        next(error)

    }
}


export const getCompanyTarget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companyTarget = await Company.findOne({
            salesTarget: { $exists: true },
        }).select('salesTarget grossProfitTarget');

        if (companyTarget) {
            return res.status(200).json({salesTarget: companyTarget.salesTarget,grossProfitTarget:companyTarget.grossProfitTarget});
        }
        return res.status(204).json();
    } catch (error) {
        next(error);
    }
};

export const setCompanyTarget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const salesTarget = req.body;


        const companyUpdate = await Company.findOneAndUpdate(
            {},
            {
                $set: {
                    salesTarget: salesTarget,
                }
            },
            { upsert: true, new: true }
        );

        if (companyUpdate) {
            return res.status(200).json(companyUpdate.salesTarget)
        }
        return res.status(204).json()
    } catch (error) {
        next(error)

    }
}

export const setProfitTarget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const grossProfitTarget = req.body;


        const companyUpdate = await Company.findOneAndUpdate(
            {},
            {
                $set: {
                    grossProfitTarget: grossProfitTarget,
                }
            },
            { upsert: true, new: true }
        );

        if (companyUpdate) {
            return res.status(200).json(companyUpdate.grossProfitTarget)
        }
        return res.status(204).json()
    } catch (error) {
        next(error)

    }
}