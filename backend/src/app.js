import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import parserRoutes from "../routes/parser.routes.js";
import userRoutes from "../routes/user.routes.js";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config({ quiet: true });

const app = express();
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
