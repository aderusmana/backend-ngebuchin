import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';
import path from 'path';

mongoose.connect(process.env.MONGODB_SECRET_STRING as string);



const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin: process.env.FRONTEND_URL || '',
    credentials: true
}));
const port = 5000;

app.use(express.static(path.join(__dirname, '../../frontend-ngebuchin/dist')));

app.use("/api/auth",authRouter)

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
})
