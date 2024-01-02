import express from 'express';
import cors from 'cors'
import dotenv from "dotenv";
import * as path from 'path';
import mongoose from 'mongoose';
import router from './routes/user.router';
import depRouter from './routes/department.router'


const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))



dotenv.config({ path: path.resolve(__dirname, '../.env') });

app.use(
	cors({
		credentials: true,
		origin: [process.env.ORIGIN1 as string],
	})
);

app.use('/', router);
app.use('/department', depRouter)

mongoose
	.connect(process.env.MONGODB_URL as string)
	.then(() => {
		console.log("Database connected and Working  ");
	});

const port = process.env.PORT;
app.listen(port, () => {
	console.log("server running..");
});