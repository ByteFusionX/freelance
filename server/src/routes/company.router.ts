import { Router } from "express";
import { getCompanyDetails, getCompanyTarget, setCompanyTarget, setProfitTarget, updateCompanyDetails } from "../controllers/company.controller";

const companyRouter = Router ()

companyRouter.get('/getCompanyDetails',getCompanyDetails)
companyRouter.patch('/updateCompanyDetails',updateCompanyDetails)

companyRouter.get('/target',getCompanyTarget)
companyRouter.patch('/setTarget',setCompanyTarget)
companyRouter.patch('/setProfitTarget',setProfitTarget)

export default companyRouter;