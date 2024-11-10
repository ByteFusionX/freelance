import express from 'express';
import cors from 'cors';
import fs from 'fs';
import dotenv from "dotenv";
import morgan from "morgan";
import * as path from 'path';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import router from './routes/user.router';
import depRouter from './routes/department.router';
import empRouter from './routes/employee.router';
import annoRouter from './routes/announcment.router';
import cusRouter from './routes/customer.router';
import equiRouter from './routes/enquiry.router';
import celebRouter from './routes/celebrationCheck.router';
import startCronJob from './service/cronService';
import quoteRouter from './routes/quotation.router';
import fileRouter from './routes/file.router';
import TokenLogger from './common/middlewares/jwt.middleware';
import jobRouter from './routes/job.router';
import catRouter from './routes/category.router';
import { socketConnection } from './service/socket-ioService';
import noteRouter from './routes/note.router';
import companyRouter from './routes/company.router';
import dashboardRouter from './routes/dashboard.router';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN1 ?? 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});
app.set('io', io);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

startCronJob();
socketConnection(io)


dotenv.config({ path: path.resolve(__dirname, '../.env') });

app.use(cors({
  origin: process.env.ORIGIN1,
  methods: ['GET', 'POST', 'PUT', 'PATCH' , 'DELETE'],
  credentials: true,
}));

app.use(TokenLogger);
app.use('/', router);
app.use('/department', depRouter);
app.use('/employee', empRouter);
app.use('/announcement', annoRouter);
app.use('/customer', cusRouter);
app.use('/enquiry', equiRouter);
app.use('/celebrationCheck', celebRouter);
app.use('/quotation', quoteRouter);
app.use('/category', catRouter);
app.use('/file', fileRouter);
app.use('/job', jobRouter);
app.use('/note', noteRouter);
app.use('/company',companyRouter)
app.use('/dashboard',dashboardRouter)

let mongoUrl = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_IP}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=admin`;
if (process.env.USE_MONGOATLAS === 'true') {
  mongoUrl = process.env.MONGODB_ATLAS_URL as string;
}
console.log(mongoUrl,'mongoUrl');
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Database connected and Working");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const uploadFolderPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadFolderPath));

if (!fs.existsSync(uploadFolderPath)) {
  fs.mkdirSync(uploadFolderPath);
}



const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
