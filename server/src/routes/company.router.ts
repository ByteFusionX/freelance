import { Router } from "express";
import { getCompanyDetails, updateCompanyDetails } from "../controllers/company.controller";

const companyRouter = Router ()

companyRouter.get('/getCompanyDetails',getCompanyDetails)
companyRouter.patch('/updateCompanyDetails',updateCompanyDetails)

export default companyRouter;