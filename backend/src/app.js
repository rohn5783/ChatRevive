import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import parserRoutes from "../routes/parser.routes.js";
import userRoutes from "../routes/user.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/chats", parserRoutes);
app.use("/api/users", userRoutes);

export default app;
