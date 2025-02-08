import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use("/api/user", userRouter);

export { app };
