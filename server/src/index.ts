import express from 'express';
import cors from 'cors'
import dotenv from "dotenv";
import morgan from "morgan";
import * as path from 'path';
import mongoose from 'mongoose';
import router from './routes/user.router';
import depRouter from './routes/department.router'
import empRouter from './routes/employee.router';
import annoRouter from './routes/announcment.router';
import cusRouter from './routes/customer.router';
import equiRouter from './routes/enquiry.router';
import celebRouter from './routes/celebrationCheck.router';
import startCronJob from './service/cronService'
import quoteRouter from './routes/quotation.router';
import fileRouter from './routes/file.router'
import TokenLogger from './common/middlewares/jwt.middleware';
import jobRouter from './routes/job.router';
import catRouter from './routes/category.router';


const app: express.Application = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
startCronJob();

dotenv.config({ path: path.resolve(__dirname, '../.env') });

app.use(
	cors({
		credentials: true,
		origin: [process.env.ORIGIN1 as string],
	})
);

app.use(TokenLogger)
app.use('/', router);
app.use('/department', depRouter)
app.use('/employee', empRouter)
app.use('/announcement', annoRouter)
app.use('/customer', cusRouter)
app.use('/enquiry', equiRouter)
app.use('/celebrationCheck', celebRouter)
app.use('/quotation', quoteRouter)
app.use('/category', catRouter)
app.use('/file', fileRouter)
app.use('/job',jobRouter)

let mongoUrl = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_IP}:${process.env.MONGO_PORT}/?authSource=admin`
if(process.env.USE_MONGOATLAS == 'true'){
	mongoUrl = process.env.MONGODB_ATLAS_URL
}

mongoose
	.connect(mongoUrl)
	.then(() => {
		console.log("Database connected and Working  ");
	});

app.use('/uploads', express.static(__dirname + '/upload'));

const port = process.env.PORT;
app.listen(port, () => {
	console.log("server running..");
});
