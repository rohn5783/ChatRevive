import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import parserRoutes from "../routes/parser.routes.js";
import userRoutes from "../routes/user.routes.js";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
dotenv.config({ quiet: true });

export const app = express();

// Configure CORS to allow credentials and specific origins
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'https://chatrevive.onrender.com', // Production frontend (adjust if different)
    'https://chat-revive-azure.vercel.app/', // Vercel frontend
    // Add other origins as needed
  ],
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const projectRoot = path.resolve(currentDirPath, "..", "..");
const frontendDistPath = path.join(projectRoot, "frontend", "dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");
const hasFrontendBuild = existsSync(frontendIndexPath);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/chats", parserRoutes);
app.use("/api/users", userRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));

  app.get("/{*path}", (req, res) => {
    res.sendFile(frontendIndexPath);
  });
}

export default app;
