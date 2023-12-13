import express from 'express';
import cors from 'cors'
import dotenv from "dotenv";
import * as path from 'path';
import mongoose from 'mongoose';
import router from './routes/user-router';


const app: express.Application = express();

const port = process.env.PORT;

app.listen(port, () => {
	console.log("server running..");
});

dotenv.config({ path: path.resolve(__dirname, '../.env') });

app.use(
	cors({
		credentials: true,
		origin: [process.env.ORIGIN1 as string],
	})
);

app.use('/', router);

mongoose
	.connect(process.env.MONGODB_URL as string)
	.then(() => {
		console.log("Database connected and Working  ");
	});
