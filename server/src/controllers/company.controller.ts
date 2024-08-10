import { Request, Response, NextFunction } from "express";
import Company from "../models/company.model"




export const getCompanyDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const company = await Company.findOne()

        if (company) {
            return res.status(200).json(company);
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

export const updateCompanyDetails = async (req:Request, res:Response, next: NextFunction)=>{
    try {
        const {companyName,description,street,area,city,country} = req.body
        

        const companyUpdate = await Company.updateOne(
            {}, // Query to find the document to update. Adjust this as needed to target a specific document.
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
            { upsert: true } // Option to insert a new document if no document matches the query.
          );

        if(companyUpdate){
            return res.status(200).json(companyUpdate)
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
        
    }
}